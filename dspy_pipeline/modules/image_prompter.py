import dspy

from dspy_pipeline.signatures import AnalyzeImagePatterns


class ImagePrompterModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.analyze = dspy.ChainOfThought(AnalyzeImagePatterns)

    def forward(self, product_specs, category, reference_image_urls):
        return self.analyze(
            product_specs=product_specs,
            category=category,
            reference_image_urls=reference_image_urls,
        )
