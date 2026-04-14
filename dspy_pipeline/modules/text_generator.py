import dspy

from dspy_pipeline.signatures import GenerateOptimizedListing


class TextGeneratorModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(GenerateOptimizedListing)

    @staticmethod
    def _serialize_diagnosis(diagnosis) -> dict:
        """Convert an AuditorModule Prediction (or dict-like) into a
        plain dict the generator can consume. Handles both dspy.Prediction
        objects (with attribute access) and plain dicts."""
        if hasattr(diagnosis, "__dict__") and not isinstance(diagnosis, dict):
            return {
                "missing_critical_attributes": getattr(diagnosis, "missing_critical_attributes", []),
                "title_issues": getattr(diagnosis, "title_issues", []),
                "description_issues": getattr(diagnosis, "description_issues", []),
                "missing_keywords": getattr(diagnosis, "missing_keywords", []),
                "priority_fixes": getattr(diagnosis, "priority_fixes", []),
            }
        return dict(diagnosis)

    def forward(self, weak_title, weak_description, weak_attributes,
                trending_keywords, category, audit_diagnosis):
        return self.generate(
            weak_title=weak_title,
            weak_description=weak_description,
            weak_attributes=weak_attributes,
            trending_keywords=trending_keywords,
            category=category,
            audit_diagnosis=self._serialize_diagnosis(audit_diagnosis),
        )
