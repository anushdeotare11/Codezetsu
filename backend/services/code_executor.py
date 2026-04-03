"""Code execution service using Judge0 API (RapidAPI free tier)."""

import asyncio
import time
from typing import Optional
import httpx

from models.schemas import CodeExecutionResult


# Judge0 CE API (free tier via RapidAPI or self-hosted)
# We'll use a mock/simulation mode for development
MOCK_MODE = True  # Set to False when you have a Judge0 API key

# Language IDs for Judge0
LANGUAGE_IDS = {
    "python": 71,      # Python 3.8.1
    "python3": 71,
    "javascript": 63,  # JavaScript Node.js 12.14.0
    "js": 63,
    "typescript": 74,  # TypeScript 3.7.4
    "ts": 74,
    "cpp": 54,         # C++ GCC 9.2.0
    "c++": 54,
    "c": 50,           # C GCC 9.2.0
    "java": 62,        # Java OpenJDK 13.0.1
    "go": 60,          # Go 1.13.5
    "rust": 73,        # Rust 1.40.0
    "ruby": 72,        # Ruby 2.7.0
}


def _simulate_execution(code: str, language: str, stdin: str) -> CodeExecutionResult:
    """
    Simulate code execution for development/demo purposes.
    This allows testing the full flow without an external API.
    """
    import re
    
    start_time = time.perf_counter()
    
    # Simple Python execution simulation
    if language.lower() in ["python", "python3"]:
        try:
            # Execute Python code in a safe way (very limited)
            import io
            import sys
            from contextlib import redirect_stdout, redirect_stderr
            
            # Create string IO for capturing output
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            # Prepare execution environment
            local_vars = {}
            
            # Set up stdin
            old_stdin = sys.stdin
            sys.stdin = io.StringIO(stdin)
            
            try:
                with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                    exec(code, {"__builtins__": __builtins__}, local_vars)
                
                output = stdout_capture.getvalue()
                error = stderr_capture.getvalue() if stderr_capture.getvalue() else None
                exit_code = 0
            except Exception as e:
                output = stdout_capture.getvalue()
                error = str(e)
                exit_code = 1
            finally:
                sys.stdin = old_stdin
            
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            
            return CodeExecutionResult(
                output=output.rstrip(),
                runtime_ms=elapsed_ms,
                error=error,
                exit_code=exit_code
            )
        except Exception as e:
            return CodeExecutionResult(
                output="",
                runtime_ms=0,
                error=f"Execution error: {str(e)}",
                exit_code=1
            )
    
    # For non-Python, return a mock response
    elapsed_ms = (time.perf_counter() - start_time) * 1000 + 50  # Add some simulated delay
    return CodeExecutionResult(
        output="Mock execution - only Python is supported in local mode",
        runtime_ms=elapsed_ms,
        error=None,
        exit_code=0
    )


class CodeExecutor:
    """Service for executing code using Judge0 API or mock mode."""
    
    def __init__(self, timeout: float = 10.0, api_key: Optional[str] = None):
        self.timeout = timeout
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=timeout + 5)
        # Judge0 public instances (CE = Community Edition)
        self.api_url = "https://judge0-ce.p.rapidapi.com"
    
    async def execute(
        self,
        code: str,
        language: str,
        stdin: str = ""
    ) -> CodeExecutionResult:
        """
        Execute code using Judge0 API or mock mode.
        
        Args:
            code: Source code to execute
            language: Programming language
            stdin: Standard input for the program
            
        Returns:
            CodeExecutionResult with output, runtime, and error info
        """
        # Use mock mode for development
        if MOCK_MODE or not self.api_key:
            return _simulate_execution(code, language, stdin)
        
        lang_id = LANGUAGE_IDS.get(language.lower())
        if not lang_id:
            return CodeExecutionResult(
                output="",
                runtime_ms=0,
                error=f"Unsupported language: {language}. Supported: {', '.join(LANGUAGE_IDS.keys())}",
                exit_code=1
            )
        
        # Prepare submission
        import base64
        payload = {
            "source_code": base64.b64encode(code.encode()).decode(),
            "language_id": lang_id,
            "stdin": base64.b64encode(stdin.encode()).decode() if stdin else "",
            "cpu_time_limit": self.timeout,
            "wall_time_limit": self.timeout * 2,
            "base64_encoded": True,
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
        
        start_time = time.perf_counter()
        
        try:
            # Create submission
            response = await self.client.post(
                f"{self.api_url}/submissions?wait=true",
                json=payload,
                headers=headers
            )
            
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            
            if response.status_code != 200 and response.status_code != 201:
                return CodeExecutionResult(
                    output="",
                    runtime_ms=elapsed_ms,
                    error=f"Execution service error: {response.status_code}",
                    exit_code=1
                )
            
            data = response.json()
            
            # Decode base64 outputs
            stdout = ""
            stderr = ""
            if data.get("stdout"):
                stdout = base64.b64decode(data["stdout"]).decode()
            if data.get("stderr"):
                stderr = base64.b64decode(data["stderr"]).decode()
            if data.get("compile_output"):
                stderr = base64.b64decode(data["compile_output"]).decode() + "\n" + stderr
            
            # Check status
            status_id = data.get("status", {}).get("id", 0)
            status_desc = data.get("status", {}).get("description", "")
            
            # Status codes: 3=Accepted, 4=Wrong Answer, 5=TLE, 6=Compilation Error, etc.
            if status_id == 5:  # Time Limit Exceeded
                return CodeExecutionResult(
                    output=stdout.rstrip(),
                    runtime_ms=elapsed_ms,
                    error="Time Limit Exceeded",
                    exit_code=-1
                )
            elif status_id == 6:  # Compilation Error
                return CodeExecutionResult(
                    output="",
                    runtime_ms=elapsed_ms,
                    error=f"Compilation Error:\n{stderr}",
                    exit_code=1
                )
            elif status_id in [7, 8, 9, 10, 11, 12]:  # Runtime errors
                return CodeExecutionResult(
                    output=stdout.rstrip(),
                    runtime_ms=elapsed_ms,
                    error=f"Runtime Error ({status_desc}):\n{stderr}",
                    exit_code=1
                )
            
            error_msg = stderr if stderr else None
            
            return CodeExecutionResult(
                output=stdout.rstrip(),
                runtime_ms=float(data.get("time", 0)) * 1000 if data.get("time") else elapsed_ms,
                error=error_msg,
                exit_code=0 if status_id == 3 else 1
            )
            
        except httpx.TimeoutException:
            return CodeExecutionResult(
                output="",
                runtime_ms=self.timeout * 1000,
                error="Time Limit Exceeded - Request timed out",
                exit_code=-1
            )
        except Exception as e:
            return CodeExecutionResult(
                output="",
                runtime_ms=0,
                error=f"Execution failed: {str(e)}",
                exit_code=1
            )
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Global executor instance
_executor: Optional[CodeExecutor] = None


def get_executor() -> CodeExecutor:
    """Get or create the global code executor instance."""
    global _executor
    if _executor is None:
        _executor = CodeExecutor()
    return _executor


async def execute_code(code: str, language: str, stdin: str = "") -> CodeExecutionResult:
    """Convenience function to execute code."""
    executor = get_executor()
    return await executor.execute(code, language, stdin)
