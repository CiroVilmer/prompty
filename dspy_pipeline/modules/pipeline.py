import dspy

from dspy_pipeline.modules.auditor import AuditorModule
from dspy_pipeline.modules.image_prompter import ImagePrompterModule
from dspy_pipeline.modules.text_generator import TextGeneratorModule


class PromptyPipeline(dspy.Module):
    """End-to-end composition. Used by the FastAPI layer. NOT the
    target of optimization — each child module is optimized
    independently and loaded from disk."""

    def __init__(self, auditor=None, generator=None, image_prompter=None):
        super().__init__()
        self.auditor = auditor or AuditorModule()
        self.generator = generator or TextGeneratorModule()
        self.image_prompter = image_prompter or ImagePrompterModule()

    def forward(self, weak_title, weak_description, weak_attributes,
                product_specs, trending_keywords, photo_urls, category):
        # product_specs is a passthrough for image_prompter only — it is
        # NOT used by the optimizable text modules (auditor, generator).
        diagnosis = self.auditor(
            weak_title=weak_title,
            weak_description=weak_description,
            weak_attributes=weak_attributes,
            category=category,
            known_trending_keywords=trending_keywords,
        )
        listing = self.generator(
            weak_title=weak_title,
            weak_description=weak_description,
            weak_attributes=weak_attributes,
            trending_keywords=trending_keywords,
            category=category,
            audit_diagnosis=diagnosis,
        )
        image = self.image_prompter(
            product_specs=product_specs,
            category=category,
            reference_image_urls=photo_urls,
        )
        return dspy.Prediction(
            diagnosis=diagnosis,
            listing=listing,
            image=image,
        )
