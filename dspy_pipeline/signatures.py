import dspy


class AuditListing(dspy.Signature):
    """Diagnose a weak Mercado Libre listing. Identify specific, actionable gaps by comparing implicitly against the standards of top-ranked CATALOG_PRODUCT listings in the same category. Flag missing technical attributes, weak or spammy titles, vague descriptions, and missing relevant keywords. Do not produce generic advice — every issue must be concrete enough for a seller to act on immediately."""

    weak_title: str = dspy.InputField(
        desc="The seller's current title. Often under-specified or generic.")
    weak_description: str = dspy.InputField(
        desc="The seller's current description. Often a single vague sentence.")
    weak_attributes: dict = dspy.InputField(
        desc="The attributes the seller has filled in so far. Usually sparse.")
    category: str = dspy.InputField(
        desc="Category name, e.g., 'notebooks'.")
    known_trending_keywords: list[str] = dspy.InputField(
        desc="Raw trending keyword list from MELI for this category. "
             "Contains both relevant and off-topic terms — exercise judgment.")

    missing_critical_attributes: list[str] = dspy.OutputField(
        desc="Specific attribute names the seller should fill in "
             "(e.g., 'RAM_MEMORY_TYPE', 'SSD_DATA_STORAGE_CAPACITY').")
    title_issues: list[str] = dspy.OutputField(
        desc="Concrete problems with the title. Each entry must be "
             "a specific issue, not 'title is too short'.")
    description_issues: list[str] = dspy.OutputField(
        desc="Concrete problems with the description.")
    missing_keywords: list[str] = dspy.OutputField(
        desc="Keywords from the trending list that are relevant to "
             "this specific product and should be incorporated.")
    priority_fixes: list[str] = dspy.OutputField(
        desc="Ordered list of the most impactful fixes first. "
             "Each fix is a single imperative sentence.")


class GenerateOptimizedListing(dspy.Signature):
    """Generate a production-quality Mercado Libre listing for the given category, working only from the seller's weak inputs and the category-level context (trending keywords, audit diagnosis). You will NOT be given full product specifications — you must infer applicable attributes from the weak title and description, using the audit diagnosis and trending keywords as signals of what buyers expect to see in this category. The title must be scannable on mobile and pack the distinguishing specs that buyers filter by. The description must follow the standard MELI three-section structure: a product overview, a technical specifications block, and a 'reasons to buy' block. Fill every attribute you can reasonably infer; leave ambiguous ones unset rather than hallucinating."""

    weak_title: str = dspy.InputField(
        desc="The user's raw title. Often vague, missing specs, or "
             "cluttered with sales language.")
    weak_description: str = dspy.InputField(
        desc="The user's raw description. Often a short sentence "
             "with no structure.")
    weak_attributes: dict = dspy.InputField(
        desc="Whatever structured attributes the user has provided "
             "so far. Usually sparse or empty. You must INFER the "
             "rest of the applicable attributes from the title and "
             "description.")
    trending_keywords: list[str] = dspy.InputField(
        desc="Category trending keywords. Use the relevant ones "
             "naturally; ignore off-topic ones.")
    category: str = dspy.InputField()
    audit_diagnosis: dict = dspy.InputField(
        desc="Serialized output from the Auditor module — use its "
             "priority_fixes and missing_keywords as direct guidance.")

    title: str = dspy.OutputField(
        desc="50-180 characters. Include brand, model/line, and "
             "key distinguishing specs.")
    description: str = dspy.OutputField(
        desc="Three sections separated by blank lines: product "
             "overview paragraph, technical specifications block "
             "(key: value per line), and 5 reasons to buy (numbered "
             "or bulleted). Plaintext, no markdown.")
    attributes: dict = dspy.OutputField(
        desc="All applicable attribute name->value pairs extracted "
             "or inferred from the weak inputs. Use the same UPPER_"
             "SNAKE_CASE keys as MELI's attribute taxonomy.")


class AnalyzeImagePatterns(dspy.Signature):
    """Given a product's specs, its category, and URLs of top-ranked reference images, output a detailed image-generation prompt suitable for Flux, DALL-E, or Midjourney. The prompt should reflect the photography conventions that work for this specific category on MELI — background treatment, angle, lighting, composition, whether infographic overlays are common, and aspect ratio. Do NOT call the reference URLs yourself; reason from the category conventions and the product specs."""

    product_specs: dict = dspy.InputField()
    category: str = dspy.InputField()
    reference_image_urls: list[str] = dspy.InputField(
        desc="URLs of top-ranked reference images. Informational only "
             "— treat them as a signal that these are category-typical "
             "product photographs.")

    image_generation_prompt: str = dspy.OutputField(
        desc="A single paragraph, detailed, ready to paste into an "
             "image generation tool.")
    aspect_ratio: str = dspy.OutputField(
        desc="e.g. '1:1', '4:5', '3:4'.")
    style_notes: str = dspy.OutputField(
        desc="Short bulleted summary of the key stylistic choices "
             "(background, angle, lighting).")
