import dspy

from dspy_pipeline.signatures import AuditListing


class AuditorModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.audit = dspy.ChainOfThought(AuditListing)

    def forward(self, weak_title, weak_description, weak_attributes,
                category, known_trending_keywords):
        return self.audit(
            weak_title=weak_title,
            weak_description=weak_description,
            weak_attributes=weak_attributes,
            category=category,
            known_trending_keywords=known_trending_keywords,
        )
