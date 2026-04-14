import os

import dspy
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

GENERATOR_LM = dspy.LM(
    "anthropic/claude-sonnet-4-6",
    api_key=ANTHROPIC_API_KEY,
    temperature=0.7,
    max_tokens=4096,
)

JUDGE_LM = dspy.LM(
    "anthropic/claude-opus-4-6",
    api_key=ANTHROPIC_API_KEY,
    temperature=0.0,
    max_tokens=2048,
)


def configure_default_lm() -> None:
    dspy.configure(lm=GENERATOR_LM)
