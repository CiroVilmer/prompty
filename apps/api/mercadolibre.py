async def get_trending_keywords(category: str) -> list[str]:
    # TODO: real MELI API call. For now return a static list for
    # the notebooks category.
    if category == "notebooks":
        return [
            "notebook hp", "lenovo ideapad", "dell inspiron",
            "macbook air", "notebook asus", "ryzen 7",
            "notebook i5", "notebook i7", "16gb ram", "ssd nvme",
        ]
    return []
