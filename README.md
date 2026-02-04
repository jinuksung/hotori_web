# Hotori Web

Next.js(App Router) + TypeScript 프론트엔드. Supabase(Postgres)에 적재된 Hotori 데이터를 **조회(Read-only)** 하는 UI부터 시작합니다.

## Requirements

- Node.js LTS
- Supabase 프로젝트(테이블: `deals`, `deal_sources`, `deal_links`, `deal_metrics_history`, `categories` 등)

## Setup

1. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

2. 실행

```bash
npm install
npm run dev
```

## Pages

- `/` : 핫딜 목록(데스크탑 테이블 / 모바일 카드)
- `/deals/[id]` : 딜 상세 + 최근 메트릭 10개 리스트

## Assets

- 로고/플레이스홀더 SVG: `public/images`
