#!/bin/bash

# .env.local 로드
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# SLACK_WEBHOOK_URL 미설정 시 정상 종료
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  exit 0
fi

# 변경된 파일 목록 수집 (언스테이징 + 스테이징)
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -10)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | head -10)

# 변경 파일이 없으면 알림 미전송
if [ -z "$CHANGED_FILES" ] && [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# 최근 커밋 메시지 수집
LAST_COMMIT=$(git log --oneline -1 2>/dev/null)

# 현재 브랜치명 수집
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# 표시할 파일 목록 결정 (스테이징 우선, 없으면 언스테이징)
FILES_TO_SHOW="${STAGED_FILES:-$CHANGED_FILES}"

# Python으로 전송 (한국어 인코딩 보장)
python3 - <<EOF
import urllib.request, json

webhook_url = """$SLACK_WEBHOOK_URL"""
branch = """$BRANCH"""
last_commit = """$LAST_COMMIT"""
files_to_show = """$FILES_TO_SHOW"""

payload = {
    "blocks": [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "✅ LIVEKLASS 작업 완료"
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*브랜치*\n\`{branch}\`"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*최근 커밋*\n{last_commit}"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*변경된 파일*\n\`\`\`{files_to_show or '변경 없음'}\`\`\`"
            }
        }
    ]
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    webhook_url,
    data=data,
    headers={'Content-Type': 'application/json; charset=utf-8'}
)
urllib.request.urlopen(req)
EOF
