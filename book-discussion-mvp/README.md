# 📚 독서 토론 메모 서비스 (MVP)

독서 모임을 만들고, 모임에 참여해서 주제별 토론과 읽기 메모를 남기는 서비스입니다.

## 기능

- 독서 모임 생성 (책 제목, 최대 인원, 모임 소개)
- 모임 참여 (닉네임 기반, 인원 제한)
- 모임 내 토론 주제 등록 및 주제별 댓글 작성
- 모임 내 읽기 메모 작성 (진도, 공개/비공개)
- 메모 삭제 및 공개 여부 토글

## 화면 흐름

```
모임 목록 → 모임 클릭 → 참여 모달(닉네임) → 모임 상세
                                                ├─ 💬 토론 탭: 주제 목록 → 주제 클릭 → 댓글 톡방
                                                └─ 📝 메모 탭: 메모 리스트 + 작성폼
```

## 기술 스택

- Node.js + Express
- 프론트엔드: Vanilla HTML/CSS/JS (빌드 도구 없음)
- 데이터 저장: In-memory 배열 (서버 재시작 시 초기화)

## 프로젝트 구조

```
book-discussion-mvp/
├── server.js            # Express 서버 진입점
├── routes/
│   └── group.js         # 모임 / 참여 / 주제 / 댓글 / 메모 API
├── public/
│   └── index.html       # 프론트엔드 SPA
└── package.json
```

## 실행 방법

```bash
cd book-discussion-mvp
npm install
npm start
```

브라우저에서 http://localhost:3000 접속

## API

### 모임

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/groups` | 모임 전체 조회 |
| GET | `/api/groups/:id` | 모임 단건 조회 |
| POST | `/api/groups` | 모임 생성 |

```json
// POST /api/groups
{ "name": "사피엔스 읽기 모임", "bookTitle": "사피엔스", "maxMembers": 10, "description": "매주 50페이지씩" }
```

### 참여

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/groups/:id/join` | 모임 참여 |
| GET | `/api/groups/:id/members` | 참여자 목록 |

```json
// POST /api/groups/:id/join
{ "nickname": "홍길동" }
```

### 토론 주제

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/groups/:id/topics` | 주제 목록 |
| POST | `/api/groups/:id/topics` | 주제 등록 |

```json
// POST /api/groups/:id/topics
{ "title": "인지혁명이 정말 혁명이었을까?", "author": "홍길동" }
```

### 댓글

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/groups/:id/topics/:topicId/comments` | 댓글 조회 |
| POST | `/api/groups/:id/topics/:topicId/comments` | 댓글 작성 |
| DELETE | `/api/groups/:id/topics/:topicId/comments/:commentId` | 댓글 삭제 |

```json
// POST /api/groups/:id/topics/:topicId/comments
{ "author": "홍길동", "content": "저는 혁명이라고 봅니다" }
```

### 메모

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/groups/:id/memos` | 메모 조회 |
| POST | `/api/groups/:id/memos` | 메모 작성 |
| DELETE | `/api/groups/:id/memos/:memoId` | 메모 삭제 |
| PATCH | `/api/groups/:id/memos/:memoId/visibility` | 공개/비공개 토글 |

```json
// POST /api/groups/:id/memos
{ "readingProgress": "120/350", "content": "인지혁명 부분이 인상적", "isPublic": false }
```

## 향후 계획

- DB 연동 (PostgreSQL 등)
- 사용자 인증/회원 관리
- 모임 탈퇴 기능
- 실시간 댓글 동기화 (WebSocket)
