@dependencies [TASK0]
@scope backend

# Task: Backend Dockerfile and Infrastructure (Terraform GCP)

## Summary
Create optimized Dockerfile for the backend, and Terraform configuration skeleton for GCP infrastructure including Cloud SQL (MySQL), MongoDB Atlas reference, Memorystore (Redis), and Pub/Sub.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/backend/Dockerfile` optimized for Bun
- Creates `/infra/` directory with Terraform configuration
- GCP-focused infrastructure (not AWS)
- TFLint and Checkov for IaC quality

## Complexity
Medium

## Dependencies
Depends on: [TASK0]
Blocks: [TASK15]
Parallel with: [TASK1, TASK2, TASK3, TASK4]

## Detailed Steps
1. Create optimized Dockerfile:
   - `/backend/Dockerfile`
   - Multi-stage build
   - Bun as runtime (not Node.js)
   - Minimal final image

2. Create Terraform configuration:
   - `/infra/main.tf` - Main resources
   - `/infra/variables.tf` - Input variables
   - `/infra/outputs.tf` - Output values
   - `/infra/providers.tf` - GCP provider

3. Define GCP resources:
   - Cloud SQL for MySQL
   - Reference to MongoDB Atlas (external)
   - Memorystore for Redis
   - Pub/Sub topics and subscriptions
   - Cloud Run for backend service

4. Configure IaC quality tools:
   - `.tflint.hcl` - TFLint configuration
   - Add TFLint and Checkov to CI scripts

5. Add turbo.json scripts:
   - `infra:lint` - Run TFLint
   - `infra:security` - Run Checkov

## Acceptance Criteria
- [ ] Dockerfile builds successfully
- [ ] Multi-stage build produces minimal image
- [ ] Terraform validates: `terraform validate`
- [ ] GCP resources defined: Cloud SQL, Memorystore, Pub/Sub
- [ ] MongoDB Atlas reference documented
- [ ] TFLint configuration exists
- [ ] Checkov can scan infrastructure
- [ ] `infra:lint` and `infra:security` scripts work

## Code Review Checklist
- [ ] Dockerfile uses Bun, not Node
- [ ] No secrets in Terraform (variables only)
- [ ] GCP best practices followed
- [ ] Minimal image size
- [ ] Resource naming conventions consistent

## Reasoning Trace
Multi-stage Dockerfile minimizes image size and attack surface. GCP infrastructure provides managed services for databases and messaging. TFLint and Checkov ensure IaC quality and security before deployment.
