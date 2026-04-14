import dspy

from dspy_pipeline.config import JUDGE_LM


class ListingQualityRubric(dspy.Signature):
    """Evaluate a generated e-commerce listing for an Argentinian Mercado Libre seller in the notebooks/laptops category, comparing it against a gold-standard CATALOG_PRODUCT reference. Be strict and specific. Focus on what drives MELI search ranking and buyer conversion: title completeness and scannability, technical attribute coverage, description structure (product overview → tech specs → reasons to buy), and relevance of trending keywords. Assume the reader is a buyer scrolling through search results on mobile.

    Note on trending_keywords: the keyword list provided is the raw category-level trending list from Mercado Libre's trends API. It contains many terms that are off-brand or off-model for any given product. The rubric treats relevance as a judgment call: a listing should not be penalized for ignoring irrelevant keywords, only for ignoring relevant ones when they exist.

    Known dataset limitation: the laptops dataset contains a small number of accessories (e.g., notebook stands). Title checks for brand/model/specs may legitimately fail on those items. This is accepted for now."""

    generated_title: str = dspy.InputField(desc="The generated listing title to evaluate.")
    generated_description: str = dspy.InputField(desc="The generated listing description to evaluate.")
    generated_attributes: dict = dspy.InputField(desc="Dict of generated product attributes (key → value).")
    reference_title: str = dspy.InputField(desc="The gold-standard CATALOG_PRODUCT title for comparison.")
    reference_description: str = dspy.InputField(desc="The gold-standard CATALOG_PRODUCT description for comparison.")
    reference_attributes_count: int = dspy.InputField(desc="Number of attributes in the gold reference listing.")
    category: str = dspy.InputField(desc="Product category (e.g. 'notebooks').")
    trending_keywords: list[str] = dspy.InputField(desc="Currently trending search keywords for this category on MELI.")

    title_has_brand: bool = dspy.OutputField(
        desc="Does the title explicitly name the brand (HP, Lenovo, Dell, etc.)?")
    title_has_model_or_line: bool = dspy.OutputField(
        desc="Does the title include the specific model or product line (e.g., '255 G10', 'IdeaPad 3')?")
    title_has_key_specs: bool = dspy.OutputField(
        desc="For laptops, does the title include at least 2 of: processor, RAM, storage, screen size?")
    title_length_ok: bool = dspy.OutputField(
        desc="Is the title at least 50 characters? MELI CATALOG_PRODUCT titles commonly run 100-180 characters because they pack distinguishing specs; the purpose of this check is to flag titles that are TOO SHORT to rank well, not to cap length. Return True if the title is 50 characters or more.")
    title_avoids_spam: bool = dspy.OutputField(
        desc="Is the title free of clickbait signals like '!!!', 'OFERTA OFERTA', 'MEJOR PRECIO', excessive caps?")

    description_completeness: int = dspy.OutputField(
        desc="1=vague one-liner; 3=covers main specs; 5=covers specs, use cases, and target buyer profile")
    description_structure: int = dspy.OutputField(
        desc="1=wall of text; 3=some paragraph breaks; 5=clear sections (overview, tech specs, reasons to buy)")
    description_answers_buyer_qs: int = dspy.OutputField(
        desc="1=raises more questions than it answers; 5=preempts obvious buyer concerns (warranty, compatibility, use fit)")

    attributes_coverage: int = dspy.OutputField(
        desc="How close is len(generated_attributes) to reference_attributes_count? 1=less than 25%, 5=90%+")

    uses_relevant_trending_keywords: bool = dspy.OutputField(
        desc="The trending_keywords list often contains terms that are off-brand or off-model relative to this specific product (for example, 'notebook dell inspiron' when evaluating an HP laptop). Return True if EITHER (a) the title or description incorporates at least one trending keyword that is genuinely relevant to this specific product, OR (b) the majority of keywords in the provided list are not relevant to this product and the listing uses the natural product-specific vocabulary you would expect (brand, model, key specs). Return False only if relevant keywords exist in the list and the listing ignores all of them.")

    reasoning: str = dspy.OutputField(
        desc="Brief, 2-4 sentences justifying the scores. Ground each claim in specific text from the generated listing.")
    top_improvement: str = dspy.OutputField(
        desc="Single most impactful concrete fix, as an imperative sentence.")


class ListingJudge(dspy.Module):
    def __init__(self):
        super().__init__()
        self.judge = dspy.ChainOfThought(ListingQualityRubric)

    def forward(self, **kwargs):
        with dspy.context(lm=JUDGE_LM):
            return self.judge(**kwargs)
