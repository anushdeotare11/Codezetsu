"""Code execution service using Piston API (free, no auth required).

Uses https://emkc.org/api/v2/piston — a free public API supporting
60+ languages with sandboxed execution. No API key needed.
Falls back to local Python exec if Piston is unavailable.
"""

import time
from typing import Optional
import httpx

from models.schemas import CodeExecutionResult

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

PISTON_LANGUAGES = {
    "python": "python3",
    "python3": "python3",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "cpp": "c++",
    "c++": "c++",
    "c": "c",
    "java": "java",
    "go": "go",
    "rust": "rust",
    "ruby": "ruby",
}


async def execute_code(
    code: str, language: str, stdin: str = ""
) -> CodeExecutionResult:
    """Execute code via Piston API. Falls back to local exec for Python."""
    piston_lang = PISTON_LANGUAGES.get(language.lower())
    if not piston_lang:
        return CodeExecutionResult(
            output="",
            runtime_ms=0,
            error=f"Unsupported language: {language}",
            exit_code=1,
        )

    start = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                PISTON_API_URL,
                json={
                    "language": piston_lang,
                    "version": "*",
                    "files": [{"content": code}],
                    "stdin": stdin,
                    "comile_timeout": 10000,
                    "run_timeout": 10000,
                },
            )

            elapsed = (time.perf_counter() - start) * 1000

            if resp.status_code != 200:
                if language.lower() in ("python", "python3"):
                    return _local_python_exec(code, stdin)
                return CodeExecutionResult(
                    output="",
                    runtime_ms=elapsed,
                    error=f"Piston API error: HTTP {resp.status_code}",
                    exit_code=1,
                )

            data = resp.json()
            run = data.get("run", {})
            stdout = run.get("stdout", "").rstrip()
            stderr = run.get("stderr", "").strip()
            exit_code = run.get("code", 0) or 0

            error = None
            if run.get("signal") == "SIGKILL":
                error = "Time Limit Exceeded"
                exit_code = -1
            elif exit_code != 0 and stderr:
                error = stderr
            elif exit_code != 0:
                error = f"Process exited with code {exit_code}"

            return CodeExecutionResult(
                output=stdout,
                runtime_ms=elapsed,
                error=error,
                exit_code=exit_code,
            )

    except httpx.TimeoutException:
        return CodeExecutionResult(
            output="", runtime_ms=10000,
            error="Time Limit Exceeded", exit_code=-1,
        )
    except Exception as e:
        if language.lower() in ("python", "python3"):
            return _local_python_exec(code, stdin)
        return CodeExecutionResult(
            output="", runtime_ms=0,
            error=f"Execution failed: {e}", exit_code=1,
        )


def _local_python_exec(code: str, stdin: str = "") -> CodeExecutionResult:
    """Fallback: execute Python locally via exec()."""
    import io, sys
    from contextlib import redirect_stdout, redirect_stderr

    start = time.perf_counter()
    out_buf, err_buf = io.StringIO(), io.StringIO()
    old_stdin = sys.stdin
    sys.stdin = io.StringIO(stdin)

    try:
        with redirect_stdout(out_buf), redirect_stderr(err_buf):
            exec(code, {"__builtins__": __builtins__}, {})
        output = out_buf.getvalue().rstrip()
        error = err_buf.getvalue().strip() or None
        exit_code = 0
    except Exception as e:
        output = out_buf.getvalue().rstrip()
        error = str(e)
        exit_code = 1
    finally:
        sys.stdin = old_stdin

    return CodeExecutionResult(
        output=output,
        runtime_ms=(time.perf_counter() - start) * 1000,
        error=error,
        exit_code=exit_code,
    )
