# Architecture Deep Dive

## 🏗️ System Architecture Philosophy

This platform follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles, ensuring:
- **Separation of Concerns**: Each service has a single, well-defined responsibility
- **Loose Coupling**: Services communicate through well-defined contracts
- **High Cohesion**: Related functionality is grouped together
- **Testability**: Each component can be tested in isolation

## 📐 Service Breakdown

### 1. API Gateway

**Responsibility**: Single entry point for all client requests

**Technology**: Node.js + Express + TypeScript

**Key Functions**:
- Route incoming requests to appropriate services
- Authenticate requests using JWT tokens
- Enforce rate limiting (Redis-backed)
- Request/response logging
- CORS handling

**Endpoints**:
```
POST   /api/auth/github/callback    - OAuth callback
GET    /api/auth/me                 - Get current user
POST   /api/auth/logout             - Logout

GET    /api/repos                   - List user's repos
POST   /api/repos/:id/activate      - Activate webhook
DELETE /api/repos/:id/deactivate    - Deactivate webhook

GET    /api/reviews                 - List reviews
GET    /api/reviews/:id             - Get review details
GET    /api/reviews/:id/issues      - Get review issues

GET    /api/analytics/developer     - Developer metrics
GET    /api/analytics/manager       - Manager metrics
GET    /api/analytics/trends        - Historical trends

POST   /api/webhooks/github         - GitHub webhook receiver
```

**Rate Limiting Strategy**:
```typescript
// Sliding window rate limiter
const rateLimiter = {
  user: { window: 3600, max: 100 },      // 100 req/hour per user
  repo: { window: 86400, max: 50 },      // 50 analyses/day per repo
  webhook: { window: 60, max: 100 }      // 100 webhooks/min
};
```

---

### 2. Authentication Service

**Responsibility**: User authentication and authorization

**Technology**: Node.js + Passport.js + JWT

**OAuth Flow**:
```
1. User clicks "Login with GitHub"
2. Redirect to GitHub OAuth: https://github.com/login/oauth/authorize
3. User authorizes app
4. GitHub redirects to callback with code
5. Exchange code for access token
6. Fetch user profile from GitHub
7. Create/update user in database
8. Generate JWT token
9. Return JWT to client
```

**Token Structure**:
```typescript
interface JWTPayload {
  userId: string;
  githubId: number;
  username: string;
  role: 'developer' | 'manager' | 'admin';
  iat: number;
  exp: number;
}
```

**Security Measures**:
- Tokens encrypted with AES-256-GCM before storage
- Refresh token rotation every 7 days
- Access tokens expire after 1 hour
- Secure HTTP-only cookies for web clients

---

### 3. GitHub Integration Service

**Responsibility**: All GitHub API interactions

**Technology**: Node.js + Octokit (GitHub SDK)

**Key Functions**:

#### Webhook Management
```typescript
async function createWebhook(repoFullName: string, secret: string) {
  const webhook = await octokit.repos.createWebhook({
    owner,
    repo,
    config: {
      url: `${WEBHOOK_URL}/api/webhooks/github`,
      content_type: 'json',
      secret: secret,
      insecure_ssl: '0'
    },
    events: ['pull_request', 'pull_request_review']
  });
  return webhook.data;
}
```

#### PR Diff Fetching
```typescript
async function getPRDiff(owner: string, repo: string, prNumber: number) {
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber
  });
  
  return files.map(file => ({
    filename: file.filename,
    status: file.status, // added, modified, removed
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch, // The actual diff
    sha: file.sha
  }));
}
```

#### Comment Posting
```typescript
async function postReviewComment(
  owner: string,
  repo: string,
  prNumber: number,
  comment: ReviewComment
) {
  await octokit.pulls.createReviewComment({
    owner,
    repo,
    pull_number: prNumber,
    body: comment.body,
    path: comment.path,
    line: comment.line,
    side: 'RIGHT' // Comment on new code
  });
}
```

**Webhook Verification**:
```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

### 4. Code Analysis Service

**Responsibility**: Preprocess code for AI analysis

**Technology**: Node.js + TypeScript

**Processing Pipeline**:

```
PR Diff → Filter Files → Detect Language → Chunk Code → Enqueue for AI
```

#### 1. File Filtering
```typescript
const IGNORED_PATTERNS = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.min\.js$/,
  /\.map$/,
  /node_modules\//,
  /dist\//,
  /build\//,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/
];

function shouldAnalyzeFile(filename: string): boolean {
  return !IGNORED_PATTERNS.some(pattern => pattern.test(filename));
}
```

#### 2. Language Detection
```typescript
const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rb': 'ruby',
  '.php': 'php',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.c': 'c'
};

function detectLanguage(filename: string): string {
  const ext = path.extname(filename);
  return LANGUAGE_MAP[ext] || 'unknown';
}
```

#### 3. Code Chunking
```typescript
// Split large files into logical chunks (max 500 lines per chunk)
function chunkCode(content: string, maxLines: number = 500): string[] {
  const lines = content.split('\n');
  if (lines.length <= maxLines) return [content];
  
  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    chunks.push(lines.slice(i, i + maxLines).join('\n'));
  }
  return chunks;
}
```

#### 4. Diff Parsing
```typescript
interface ParsedDiff {
  additions: CodeLine[];
  deletions: CodeLine[];
  context: CodeLine[];
}

function parseDiff(patch: string): ParsedDiff {
  const lines = patch.split('\n');
  const additions: CodeLine[] = [];
  const deletions: CodeLine[] = [];
  const context: CodeLine[] = [];
  
  let lineNumber = 0;
  
  for (const line of lines) {
    if (line.startsWith('@@')) {
      // Parse line number from @@ -10,5 +12,7 @@
      const match = line.match(/\+(\d+)/);
      lineNumber = match ? parseInt(match[1]) : 0;
    } else if (line.startsWith('+')) {
      additions.push({ number: lineNumber++, content: line.slice(1) });
    } else if (line.startsWith('-')) {
      deletions.push({ number: lineNumber, content: line.slice(1) });
    } else {
      context.push({ number: lineNumber++, content: line });
    }
  }
  
  return { additions, deletions, context };
}
```

---

### 5. AI Review Engine

**Responsibility**: Analyze code using AI and generate structured feedback

**Technology**: Node.js + OpenAI SDK

**Prompt Engineering Strategy**:

```typescript
class PromptBuilder {
  private language: string;
  private context: PRContext;
  
  buildSystemPrompt(): string {
    return `You are an expert ${this.language} code reviewer.
Your goal is to identify:
- Bugs and logic errors
- Security vulnerabilities
- Performance issues
- Code smells and anti-patterns
- Best practice violations

Provide actionable, specific feedback with line numbers and code examples.`;
  }
  
  buildUserPrompt(file: FileChange): string {
    return `
**File**: ${file.path}
**Language**: ${this.language}
**PR Context**: ${this.context.title}

**Changed Code**:
\`\`\`${this.language}
${file.diff}
\`\`\`

Analyze this code and return a JSON response with this exact structure:
{
  "issues": [
    {
      "line": <number>,
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "category": "bug" | "security" | "performance" | "style" | "best-practice",
      "title": "<concise title>",
      "description": "<detailed explanation>",
      "suggestedFix": "<code or action>"
    }
  ],
  "summary": "<overall assessment>",
  "qualityScore": <0-100>
}`;
  }
}
```

**AI Call with Retry Logic**:
```typescript
async function analyzeWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<AIResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower for consistency
        max_tokens: 2000
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

**Response Validation**:
```typescript
function validateAIResponse(response: any): AIResponse {
  const schema = z.object({
    issues: z.array(z.object({
      line: z.number(),
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      category: z.enum(['bug', 'security', 'performance', 'style', 'best-practice']),
      title: z.string(),
      description: z.string(),
      suggestedFix: z.string()
    })),
    summary: z.string(),
    qualityScore: z.number().min(0).max(100)
  });
  
  return schema.parse(response);
}
```

---

### 6. Feedback Publisher Service

**Responsibility**: Post AI feedback to GitHub PRs

**Technology**: Node.js + Octokit

**Comment Formatting**:
```typescript
function formatComment(issue: Issue): string {
  const severityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
    info: 'ℹ️'
  };
  
  return `
${severityEmoji[issue.severity]} **${issue.title}**

**Category**: ${issue.category}
**Severity**: ${issue.severity}

${issue.description}

**Suggested Fix**:
\`\`\`
${issue.suggestedFix}
\`\`\`

---
*Generated by AI Code Review Bot*
`;
}
```

**Batch Comment Posting**:
```typescript
async function publishReview(
  pr: PullRequest,
  review: Review,
  issues: Issue[]
) {
  // 1. Post inline comments
  const comments = issues.map(issue => ({
    path: issue.filePath,
    line: issue.lineNumber,
    body: formatComment(issue)
  }));
  
  await postCommentsInBatches(comments, 10); // 10 at a time
  
  // 2. Post summary comment
  const summary = formatSummary(review, issues);
  await postPRComment(pr, summary);
}
```

---

### 7. Analytics Service

**Responsibility**: Aggregate metrics and generate insights

**Technology**: Node.js + TimescaleDB

**Metrics Tracked**:

```typescript
interface DeveloperMetrics {
  userId: string;
  period: 'day' | 'week' | 'month';
  metrics: {
    prsReviewed: number;
    averageQualityScore: number;
    totalIssues: number;
    criticalIssues: number;
    mostCommonCategory: string;
    improvementTrend: number; // % change
  };
}

interface ManagerMetrics {
  teamId: string;
  period: 'day' | 'week' | 'month';
  metrics: {
    teamQualityScore: number;
    totalPRs: number;
    securityRisks: number;
    topContributors: Array<{ userId: string; score: number }>;
    hotspotRepos: Array<{ repoId: string; issueCount: number }>;
  };
}
```

**Time-Series Queries**:
```sql
-- Get developer quality trend over last 30 days
SELECT 
  time_bucket('1 day', time) AS day,
  AVG(quality_score) AS avg_score,
  COUNT(*) AS pr_count
FROM code_quality_metrics
WHERE user_id = $1
  AND time > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

---

## 🔄 Data Flow Example

### Complete PR Review Flow

```
1. Developer opens PR #123 in repo "acme/api"
   
2. GitHub sends webhook:
   POST /api/webhooks/github
   {
     "action": "opened",
     "pull_request": { ... },
     "repository": { ... }
   }

3. Webhook Service:
   - Verifies signature ✓
   - Extracts PR metadata
   - Publishes to queue: "pr.opened"

4. Code Analysis Worker picks up job:
   - Fetches PR diff from GitHub API
   - Filters files: 5 files → 3 analyzable
   - Detects languages: 2 TypeScript, 1 Python
   - Chunks large files
   - Publishes to queue: "code.analyze" (3 jobs)

5. AI Review Workers (parallel):
   Worker 1: Analyzes file1.ts → 2 issues
   Worker 2: Analyzes file2.ts → 0 issues
   Worker 3: Analyzes utils.py → 1 issue
   
6. Results aggregated:
   - Total: 3 issues (1 high, 2 medium)
   - Quality score: 82/100
   - Saved to database

7. Feedback Publisher:
   - Posts 3 inline comments on GitHub
   - Posts summary comment
   - Updates PR status check

8. Analytics Service:
   - Records metrics in TimescaleDB
   - Updates developer dashboard
   - Triggers real-time UI update

9. Developer sees feedback in <30 seconds
```

---

## 🚀 Scaling Considerations

### Horizontal Scaling

**Stateless Services**: All services are stateless and can scale independently
```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-review-worker
spec:
  replicas: 10  # Scale to 10 workers
  selector:
    matchLabels:
      app: ai-review-worker
```

**Auto-Scaling Rules**:
- Scale AI workers based on queue depth
- Scale API gateway based on request rate
- Scale analytics service based on query load

### Database Optimization

**Indexing Strategy**:
```sql
-- Optimize PR lookups
CREATE INDEX idx_pr_repo_number ON pull_requests(repository_id, pr_number);

-- Optimize review queries
CREATE INDEX idx_review_pr ON reviews(pull_request_id);
CREATE INDEX idx_review_status ON reviews(status);

-- Optimize analytics queries
CREATE INDEX idx_metrics_user_time ON code_quality_metrics(user_id, time DESC);
CREATE INDEX idx_metrics_repo_time ON code_quality_metrics(repository_id, time DESC);
```

**Connection Pooling**:
```typescript
const pool = new Pool({
  max: 20, // Max 20 connections per service
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### Caching Strategy

**Multi-Layer Cache**:
```
L1: In-memory (Node.js) - 1 minute TTL
L2: Redis - 1 hour TTL
L3: Database
```

**Cache Keys**:
```typescript
const cacheKeys = {
  fileAnalysis: (sha: string) => `analysis:${sha}`,
  userRepos: (userId: string) => `repos:${userId}`,
  prReview: (prId: string) => `review:${prId}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`
};
```

---

## 🔐 Security Architecture

### Defense in Depth

1. **Network Layer**: VPC, security groups, WAF
2. **Application Layer**: Input validation, rate limiting, CORS
3. **Authentication Layer**: OAuth, JWT, token rotation
4. **Data Layer**: Encryption at rest, encrypted connections
5. **Monitoring Layer**: Intrusion detection, audit logs

### Secrets Management

```typescript
// Never hardcode secrets
const config = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: await secretsManager.getSecret('github-client-secret')
  },
  openai: {
    apiKey: await secretsManager.getSecret('openai-api-key')
  },
  database: {
    password: await secretsManager.getSecret('db-password')
  }
};
```

---

## 📊 Monitoring & Observability

### Metrics to Track

**Application Metrics**:
- Request rate, latency, error rate (RED metrics)
- Queue depth and processing time
- AI API response time and token usage
- Database query performance

**Business Metrics**:
- PRs analyzed per day
- Average review completion time
- Issue detection rate
- User engagement (DAU, MAU)

### Alerting Rules

```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    
  - name: QueueBacklog
    condition: queue_depth > 1000
    duration: 10m
    severity: warning
    
  - name: AIAPIFailure
    condition: ai_api_success_rate < 90%
    duration: 5m
    severity: critical
```

---

This architecture is designed for **production scale**, **security**, and **maintainability**. Every decision is intentional and follows industry best practices.
