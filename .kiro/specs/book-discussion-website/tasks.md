# 구현 계획: 독서 토론 웹사이트

## 개요

독서 토론 웹사이트 MVP를 백엔드(Node.js + Express + TypeScript)와 프론트엔드(React + TypeScript)로 나누어 점진적으로 구현한다. 백엔드 API를 먼저 구축한 후 프론트엔드를 연동하는 순서로 진행한다.

## Tasks

- [x] 1. 프로젝트 초기 설정 및 데이터 모델 구성
  - [x] 1.1 백엔드 프로젝트 초기화 (Node.js + Express + TypeScript + Prisma + Vitest + fast-check)
    - `server/` 디렉토리에 Express + TypeScript 프로젝트 생성
    - Prisma, Zod, bcrypt, jsonwebtoken, axios 의존성 설치
    - Vitest + fast-check 테스트 환경 구성
    - tsconfig.json, vitest.config.ts 설정
    - _Requirements: 전체_
  - [x] 1.2 Prisma 스키마 및 데이터 모델 정의
    - User, Book, Group, GroupMember, Memo, Discussion, Comment, Reply 모델 정의
    - 관계, 유니크 제약, 기본값, CHECK 제약 조건 설정
    - MySQL 연결 설정 및 마이그레이션 생성
    - _Requirements: 전체 (설계 문서 데이터 모델 섹션)_
  - [x] 1.3 Zod 입력 검증 스키마 작성
    - SignupSchema, LoginSchema, CreateGroupSchema, CreateMemoSchema, UpdateMemoSchema, CreateDiscussionSchema, CreateCommentSchema 정의
    - 설계 문서의 검증 규칙 반영 (이메일 형식, 비밀번호 8자 이상, pageEnd >= pageStart 등)
    - _Requirements: 1.1, 1.2, 1.3, 3.5, 7.1, 7.2, 10.3_
  - [ ]* 1.4 Zod 스키마 속성 기반 테스트 작성
    - **Property 3: 짧은 비밀번호 거부** — 8자 미만 문자열은 SignupSchema 검증 실패
    - **Validates: Requirements 1.3**
    - **Property 7: 모임 생성 시 필수 항목 검증** — 필수 항목 누락 시 CreateGroupSchema 검증 실패
    - **Validates: Requirements 3.5**
    - **Property 16: 빈 메모 내용 거부** — 빈 문자열은 CreateMemoSchema 검증 실패
    - **Validates: Requirements 7.2**
    - **Property 25: 빈 토론 주제 제목 거부** — 빈 문자열은 CreateDiscussionSchema 검증 실패
    - **Validates: Requirements 10.3**

- [x] 2. 인증 시스템 구현
  - [x] 2.1 AuthService 구현 (signup, login, refreshToken, validateToken)
    - bcrypt를 사용한 비밀번호 해싱 및 비교
    - JWT Access Token + Refresh Token 발급 로직
    - 중복 이메일 검사 및 에러 처리
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_
  - [x] 2.2 인증 미들웨어 구현
    - JWT 토큰 검증 미들웨어 (Authorization 헤더 파싱)
    - 만료/무효 토큰 시 401 응답 반환
    - _Requirements: 2.3, 2.4_
  - [x] 2.3 인증 라우터 및 컨트롤러 구현
    - POST /api/auth/signup, POST /api/auth/login, POST /api/auth/refresh 엔드포인트
    - Zod 스키마를 통한 요청 검증
    - 에러 응답 형식 통일 (ErrorResponse 인터페이스)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_
  - [ ]* 2.4 인증 서비스 속성 기반 테스트 작성
    - **Property 1: 회원가입-로그인 라운드트립** — 유효한 자격 증명으로 가입 후 동일 자격 증명으로 로그인 시 토큰 발급
    - **Validates: Requirements 1.1, 2.1**
    - **Property 2: 중복 이메일 회원가입 거부** — 이미 등록된 이메일로 재가입 시도 시 거부
    - **Validates: Requirements 1.2**
    - **Property 4: 잘못된 자격 증명 로그인 거부** — 올바르지 않은 비밀번호로 로그인 시 거부
    - **Validates: Requirements 2.2**
    - **Property 5: 토큰 유효성에 따른 접근 제어** — 유효 토큰은 인증 성공, 만료/무효 토큰은 401 반환
    - **Validates: Requirements 2.3, 2.4**

- [x] 3. 체크포인트 - 인증 시스템 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 4. 모임 및 책 검색 기능 구현
  - [x] 4.1 BookSearchService 구현 (카카오/네이버 API 연동)
    - 외부 책 검색 API 호출 및 응답 파싱
    - API 실패 시 에러 처리 (502 EXTERNAL_API_ERROR)
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.2 GroupService 구현 (create, list, getDetail, join)
    - 모임 생성 시 Book 엔티티 생성/조회 및 GroupMember(owner) 자동 등록
    - 모임 목록 조회 (페이지네이션, 책 제목 검색 필터)
    - 모임 상세 조회 (책 정보, 참여자 목록, 독서 진행률, 최근 메모/토론 요약)
    - 모임 참여 (인원 초과 차단, 중복 참여 차단)
    - _Requirements: 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_
  - [x] 4.3 모임 및 책 검색 라우터/컨트롤러 구현
    - GET /api/books/search, GET /api/groups, POST /api/groups, GET /api/groups/:id, POST /api/groups/:id/join 엔드포인트
    - 인증 미들웨어 적용
    - _Requirements: 3.1, 3.4, 4.1, 4.3, 5.1_
  - [ ]* 4.4 모임 서비스 속성 기반 테스트 작성
    - **Property 6: 모임 생성 라운드트립** — 유효한 데이터로 모임 생성 후 조회 시 동일 데이터 반환
    - **Validates: Requirements 3.4**
    - **Property 8: 모임 생성자는 방장이자 첫 번째 참여자** — 생성 후 참여자 목록에 owner 역할로 포함
    - **Validates: Requirements 3.6**
    - **Property 9: 모임 카드 필수 정보 포함** — 목록 API 반환 시 필수 정보 모두 포함
    - **Validates: Requirements 4.2**
    - **Property 10: 모임 검색 결과 정확성** — 검색 결과의 모든 모임 책 제목에 검색어 포함
    - **Validates: Requirements 4.3**
    - **Property 11: 모임 참여 후 참여자 목록 포함** — 참여 후 해당 사용자가 목록에 포함
    - **Validates: Requirements 5.1**
    - **Property 12: 모집 인원 초과 참여 차단** — 가득 찬 모임에 참여 시도 시 거부
    - **Validates: Requirements 5.2**
    - **Property 13: 중복 참여 차단** — 이미 참여 중인 모임에 재참여 시도 시 거부
    - **Validates: Requirements 5.3**

- [x] 5. 체크포인트 - 모임 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 6. 메모 기능 구현
  - [x] 6.1 MemoService 구현 (create, update, delete, updateVisibility, listByGroup)
    - 메모 CRUD 및 공개 여부 변경
    - 기본 공개 여부 비공개(false) 설정
    - 본인 메모만 수정/삭제 가능 (403 FORBIDDEN)
    - 메모 목록: 본인 전체 메모 + 타인 공개 메모만 반환
    - 독서 진행률 기반 메모 내용 열람 제어 (page_end > 진행률이면 내용 숨김)
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_
  - [x] 6.2 메모 라우터/컨트롤러 구현
    - GET /api/groups/:groupId/memos, POST /api/groups/:groupId/memos, PUT /api/memos/:id, DELETE /api/memos/:id, PATCH /api/memos/:id/visibility 엔드포인트
    - 인증 미들웨어 적용
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 9.1_
  - [ ]* 6.3 메모 서비스 속성 기반 테스트 작성
    - **Property 15: 메모 저장 라운드트립** — 유효한 데이터로 메모 작성 후 조회 시 동일 데이터 반환
    - **Validates: Requirements 7.1**
    - **Property 17: 메모 기본 공개 여부는 비공개** — 공개 여부 미지정 시 is_public = false
    - **Validates: Requirements 7.3**
    - **Property 18: 메모 업데이트 반영** — 수정 후 조회 시 수정된 값 반환
    - **Validates: Requirements 8.1, 8.3**
    - **Property 19: 메모 삭제 후 목록에서 제거** — 삭제 후 목록에 미포함
    - **Validates: Requirements 8.2**
    - **Property 20: 타인 메모 수정/삭제 권한 차단** — 타인 메모 수정/삭제 시 거부
    - **Validates: Requirements 8.4**
    - **Property 21: 메모 목록에서 본인 메모와 공개 메모 구분** — 본인 전체 + 타인 공개만 반환
    - **Validates: Requirements 9.1**
    - **Property 22: 독서 진행률 기반 메모 열람 제어** — 진행률 < page_end이면 내용 숨김
    - **Validates: Requirements 9.2, 9.3**

- [x] 7. 체크포인트 - 메모 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 8. 토론 기능 구현
  - [x] 8.1 DiscussionService 구현 (createTopic, listTopics, addComment, addReply, getRecommendations)
    - 토론 주제 생성 (메모 참조 연결 포함)
    - 토론 주제 목록 조회 (작성자 필터)
    - 의견 작성 및 댓글(Reply) 작성
    - 추천 엔진: 공개 메모 2개 이상 시 키워드 기반 토론 주제 후보 생성
    - 추천 주제 선택 시 is_recommended = true로 토론 스레드 자동 생성
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3_
  - [x] 8.2 토론 라우터/컨트롤러 구현
    - GET /api/groups/:groupId/discussions, POST /api/groups/:groupId/discussions
    - GET /api/discussions/:id/comments, POST /api/discussions/:id/comments, POST /api/comments/:id/replies
    - GET /api/groups/:groupId/discussions/recommendations
    - 인증 미들웨어 적용
    - _Requirements: 10.1, 11.1, 11.2, 11.3, 12.2_
  - [ ]* 8.3 토론 서비스 속성 기반 테스트 작성
    - **Property 23: 토론 주제 생성 라운드트립** — 유효한 데이터로 생성 후 조회 시 동일 데이터 반환
    - **Validates: Requirements 10.1**
    - **Property 24: 메모-토론 주제 참조 연결** — 메모 연결 후 토론 주제에 원본 메모 ID 포함
    - **Validates: Requirements 10.2**
    - **Property 26: 스레드 글 작성 라운드트립** — 의견/댓글 작성 후 올바른 위치에 포함
    - **Validates: Requirements 11.2, 11.3**
    - **Property 27: 작성자 필터 정확성** — 필터링 결과의 모든 항목 작성자가 해당 참여자
    - **Validates: Requirements 11.4**
    - **Property 28: 공개 메모 기반 추천 주제 생성 조건** — 공개 메모 2개 이상이면 추천 생성, 미만이면 미생성
    - **Validates: Requirements 12.1**
    - **Property 29: 추천 주제 선택 시 토론 스레드 자동 생성** — 선택 시 is_recommended = true인 토론 생성
    - **Validates: Requirements 12.3**

- [x] 9. 체크포인트 - 토론 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 10. 마이페이지 API 구현
  - [x] 10.1 마이페이지 서비스 및 라우터 구현
    - GET /api/me/groups (참여 모임 목록), GET /api/me/memos (작성 메모 목록), GET /api/me/discussions (참여 토론 목록)
    - 인증 미들웨어 적용
    - _Requirements: 13.1_
  - [ ]* 10.2 마이페이지 속성 기반 테스트 작성
    - **Property 30: 마이페이지 활동 데이터 완전성** — 모임 참여, 메모 작성, 토론 참여 후 각 목록에 포함
    - **Validates: Requirements 13.1**
  - [ ]* 10.3 독서 진행률 속성 기반 테스트 작성
    - **Property 14: 독서 진행률 업데이트 라운드트립** — 진행률 업데이트 후 조회 시 동일 값 반환
    - **Validates: Requirements 6.2**

- [x] 11. 체크포인트 - 백엔드 전체 검증
  - 모든 백엔드 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

- [x] 12. 프론트엔드 프로젝트 초기 설정
  - [x] 12.1 React + TypeScript 프로젝트 초기화
    - `client/` 디렉토리에 Vite + React + TypeScript 프로젝트 생성
    - Zustand, Axios, React Router 의존성 설치
    - 프로젝트 구조 설정 (pages, components, stores, api, types)
    - _Requirements: 전체_
  - [x] 12.2 Axios 인스턴스 및 인터셉터 설정
    - baseURL 설정, Authorization 헤더 자동 첨부
    - 401 응답 시 자동 토큰 갱신 인터셉터
    - 갱신 실패 시 로그인 페이지 리다이렉트
    - _Requirements: 2.3, 2.4_
  - [x] 12.3 인증 상태 관리 (Zustand store)
    - accessToken, refreshToken, user 상태 관리
    - login, logout, refreshToken 액션
    - _Requirements: 2.1, 2.3_

- [x] 13. 프론트엔드 인증 페이지 구현
  - [x] 13.1 회원가입 페이지 (/signup)
    - 이메일, 비밀번호, 닉네임 입력 폼
    - 클라이언트 측 유효성 검증 (이메일 형식, 비밀번호 8자 이상)
    - 서버 에러 메시지 표시 (중복 이메일 등)
    - 가입 성공 시 로그인 페이지로 이동
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 13.2 로그인 페이지 (/login)
    - 이메일, 비밀번호 입력 폼
    - 로그인 성공 시 토큰 저장 및 홈으로 이동
    - 에러 메시지 표시 (잘못된 자격 증명)
    - _Requirements: 2.1, 2.2_

- [x] 14. 프론트엔드 모임 관련 페이지 구현
  - [x] 14.1 홈/모임 목록 페이지 (/)
    - 모임 카드 리스트 (책 제목, 줄거리, 모임 소개, 독서 기간, 토론 날짜, 참여 인원)
    - 책 제목 검색 기능
    - 검색 결과 없음 메시지 표시
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 14.2 모임 생성 페이지 (/groups/new)
    - 책 검색 및 선택 UI (검색 결과 목록, 자동 입력)
    - 검색 실패 시 수동 입력 모드 전환
    - 모임명, 방 소개, 모집 인원, 독서 기간, 토론 날짜 입력 폼
    - 필수 항목 검증 및 에러 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 14.3 모임 상세 페이지 (/groups/:id)
    - 책 정보, 모임 정보, 참여자 목록, 독서 진행률 표시
    - 참여하기 버튼 (인원 마감/이미 참여 시 비활성화 및 메시지)
    - 메모 작성, 토론 페이지 이동 링크
    - 최근 메모/토론 요약 표시
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_

- [x] 15. 프론트엔드 메모 페이지 구현
  - [x] 15.1 메모 작성/리스트 페이지 (/groups/:id/memos)
    - 메모 작성 폼 (읽은 범위, 내용, 공개/비공개 토글 - 기본 비공개)
    - 본인 메모 목록 (수정/삭제/공개 여부 변경 가능)
    - 타인 공개 메모 목록 (독서 진행률 기반 열람 제어)
    - 진행률 미달 시 "해당 범위까지 읽은 후 열람할 수 있습니다" 메시지
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_

- [x] 16. 프론트엔드 토론 페이지 구현
  - [x] 16.1 토론 목록/생성 페이지 (/groups/:id/discussions)
    - 토론 주제 목록 표시
    - 토론 주제 생성 폼 (제목, 내용, 메모 연결 선택)
    - 추천 주제 영역 표시 및 선택 시 스레드 자동 생성
    - 작성자 필터 기능
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.4, 12.2, 12.3_
  - [x] 16.2 토론 스레드 페이지 (/discussions/:id)
    - 토론 주제 상세 (원본 메모 참조 표시)
    - 의견 목록 및 의견 작성 폼
    - 의견별 댓글 목록 및 댓글 작성 폼
    - _Requirements: 11.2, 11.3_

- [x] 17. 프론트엔드 마이페이지 구현
  - [x] 17.1 마이페이지 (/mypage)
    - 참여 모임 목록 (클릭 시 모임 상세로 이동)
    - 작성 메모 목록 (클릭 시 해당 모임 메모 리스트로 이동)
    - 참여 토론 목록 (클릭 시 토론 스레드로 이동)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 18. 프론트엔드-백엔드 통합 및 글로벌 에러 처리
  - [x] 18.1 글로벌 에러 핸들러 구현 (백엔드)
    - Express 글로벌 에러 핸들링 미들웨어
    - 일관된 ErrorResponse 형식 반환
    - 예상치 못한 에러 500 응답 처리
    - _Requirements: 전체 (설계 문서 에러 처리 섹션)_
  - [x] 18.2 프론트엔드 에러 처리 통합
    - 네트워크 에러 토스트 메시지
    - 폼 검증 에러 필드별 표시
    - 외부 API 에러 시 수동 입력 모드 전환
    - _Requirements: 3.3, 전체 (설계 문서 에러 처리 섹션)_

- [x] 19. 최종 체크포인트 - 전체 시스템 검증
  - 모든 테스트가 통과하는지 확인하고, 질문이 있으면 사용자에게 문의한다.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있습니다.
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다.
- 체크포인트에서 점진적으로 검증하며 진행합니다.
- 속성 기반 테스트는 설계 문서의 정확성 속성을 검증합니다.
- 단위 테스트는 구체적인 예시와 엣지 케이스를 검증합니다.
