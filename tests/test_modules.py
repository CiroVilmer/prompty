import inspect
from unittest.mock import MagicMock, patch

import dspy
import pytest

from dspy_pipeline.modules.auditor import AuditorModule
from dspy_pipeline.modules.image_prompter import ImagePrompterModule
from dspy_pipeline.modules.pipeline import PromptyPipeline
from dspy_pipeline.modules.text_generator import TextGeneratorModule


def _audit_prediction():
    return dspy.Prediction(
        missing_critical_attributes=["RAM_MEMORY_TYPE", "SSD_DATA_STORAGE_CAPACITY"],
        title_issues=["Missing processor in title"],
        description_issues=["Only one vague sentence"],
        missing_keywords=["notebook hp"],
        priority_fixes=["Add processor and RAM to title"],
        reasoning="The listing is weak.",
    )


def _generator_prediction():
    return dspy.Prediction(
        title="Notebook HP 255 G10 Ryzen 7 | 16GB RAM | 512GB SSD",
        description="Overview paragraph.\n\nSpecs block.\n\nReasons to buy.",
        attributes={"BRAND": "HP", "MODEL": "255 G10", "RAM_MEMORY_TYPE": "DDR4"},
        reasoning="Generated from weak inputs.",
    )


def _image_prediction():
    return dspy.Prediction(
        image_generation_prompt="Professional product photo of a laptop on white background.",
        aspect_ratio="1:1",
        style_notes="- White background\n- 3/4 angle\n- Soft diffused lighting",
        reasoning="Standard MELI laptop photo conventions.",
    )


class TestAuditorModule:
    @patch("dspy_pipeline.modules.auditor.dspy.ChainOfThought")
    def test_forward_returns_prediction(self, mock_cot_cls):
        mock_cot_cls.return_value = MagicMock(return_value=_audit_prediction())
        auditor = AuditorModule()
        result = auditor(
            weak_title="HP buen precio",
            weak_description="Notebook en buen estado.",
            weak_attributes={"BRAND": "HP"},
            category="notebooks",
            known_trending_keywords=["notebook hp"],
        )
        assert isinstance(result, dspy.Prediction)
        assert isinstance(result.missing_critical_attributes, list)
        assert isinstance(result.title_issues, list)
        assert isinstance(result.description_issues, list)
        assert isinstance(result.missing_keywords, list)
        assert isinstance(result.priority_fixes, list)


class TestTextGeneratorModule:
    @patch("dspy_pipeline.modules.text_generator.dspy.ChainOfThought")
    def test_forward_returns_prediction(self, mock_cot_cls):
        mock_cot_cls.return_value = MagicMock(return_value=_generator_prediction())
        gen = TextGeneratorModule()
        result = gen(
            weak_title="HP buen precio",
            weak_description="Notebook en buen estado.",
            weak_attributes={"BRAND": "HP"},
            trending_keywords=["notebook hp"],
            category="notebooks",
            audit_diagnosis=_audit_prediction(),
        )
        assert isinstance(result, dspy.Prediction)
        assert isinstance(result.title, str)
        assert isinstance(result.description, str)
        assert isinstance(result.attributes, dict)

    def test_serialize_diagnosis_from_prediction(self):
        pred = _audit_prediction()
        result = TextGeneratorModule._serialize_diagnosis(pred)
        assert isinstance(result, dict)
        assert result["missing_critical_attributes"] == ["RAM_MEMORY_TYPE", "SSD_DATA_STORAGE_CAPACITY"]
        assert result["title_issues"] == ["Missing processor in title"]
        assert result["priority_fixes"] == ["Add processor and RAM to title"]

    def test_serialize_diagnosis_from_dict(self):
        d = {
            "missing_critical_attributes": ["X"],
            "title_issues": ["Y"],
            "description_issues": [],
            "missing_keywords": [],
            "priority_fixes": ["Z"],
        }
        result = TextGeneratorModule._serialize_diagnosis(d)
        assert result == d

    def test_serialize_diagnosis_from_empty_prediction(self):
        pred = dspy.Prediction()
        result = TextGeneratorModule._serialize_diagnosis(pred)
        assert result["missing_critical_attributes"] == []
        assert result["priority_fixes"] == []

    def test_generator_does_not_receive_product_specs(self):
        """Regression guard: product_specs must NOT be a parameter of
        TextGeneratorModule.forward — that was the input leak."""
        sig = inspect.signature(TextGeneratorModule.forward)
        param_names = set(sig.parameters.keys()) - {"self"}
        assert "product_specs" not in param_names
        assert "weak_title" in param_names
        assert "weak_description" in param_names
        assert "weak_attributes" in param_names


class TestImagePrompterModule:
    @patch("dspy_pipeline.modules.image_prompter.dspy.ChainOfThought")
    def test_forward_returns_prediction(self, mock_cot_cls):
        mock_cot_cls.return_value = MagicMock(return_value=_image_prediction())
        img = ImagePrompterModule()
        result = img(
            product_specs={"BRAND": "HP"},
            category="notebooks",
            reference_image_urls=["https://example.com/photo.jpg"],
        )
        assert isinstance(result, dspy.Prediction)
        assert isinstance(result.image_generation_prompt, str)
        assert isinstance(result.aspect_ratio, str)
        assert isinstance(result.style_notes, str)


class TestPromptyPipeline:
    def test_pipeline_composes_all_modules(self):
        mock_auditor = MagicMock(spec=AuditorModule)
        mock_auditor.return_value = _audit_prediction()

        mock_generator = MagicMock(spec=TextGeneratorModule)
        mock_generator.return_value = _generator_prediction()

        mock_image = MagicMock(spec=ImagePrompterModule)
        mock_image.return_value = _image_prediction()

        pipeline = PromptyPipeline(
            auditor=mock_auditor,
            generator=mock_generator,
            image_prompter=mock_image,
        )
        result = pipeline(
            weak_title="HP buen precio",
            weak_description="Notebook en buen estado.",
            weak_attributes={"BRAND": "HP"},
            product_specs={"BRAND": "HP", "MODEL": "255 G10"},
            trending_keywords=["notebook hp"],
            photo_urls=["https://example.com/photo.jpg"],
            category="notebooks",
        )

        assert isinstance(result, dspy.Prediction)
        assert result.diagnosis == _audit_prediction()
        assert result.listing == _generator_prediction()
        assert result.image == _image_prediction()

        mock_auditor.assert_called_once()
        mock_generator.assert_called_once()
        mock_image.assert_called_once()

        gen_call_kwargs = mock_generator.call_args[1]
        assert gen_call_kwargs["audit_diagnosis"] == _audit_prediction()
        assert "product_specs" not in gen_call_kwargs
        assert gen_call_kwargs["weak_title"] == "HP buen precio"

    def test_pipeline_passes_auditor_output_to_generator(self):
        audit_result = _audit_prediction()
        mock_auditor = MagicMock(spec=AuditorModule)
        mock_auditor.return_value = audit_result

        mock_generator = MagicMock(spec=TextGeneratorModule)
        mock_generator.return_value = _generator_prediction()

        mock_image = MagicMock(spec=ImagePrompterModule)
        mock_image.return_value = _image_prediction()

        pipeline = PromptyPipeline(
            auditor=mock_auditor,
            generator=mock_generator,
            image_prompter=mock_image,
        )
        pipeline(
            weak_title="HP buen precio",
            weak_description="Notebook en buen estado.",
            weak_attributes={"BRAND": "HP"},
            product_specs={"BRAND": "HP"},
            trending_keywords=[],
            photo_urls=[],
            category="notebooks",
        )

        gen_kwargs = mock_generator.call_args[1]
        assert gen_kwargs["audit_diagnosis"] is audit_result

    def test_product_specs_passthrough_to_image_prompter_only(self):
        """product_specs should reach image_prompter but NOT generator."""
        mock_auditor = MagicMock(spec=AuditorModule)
        mock_auditor.return_value = _audit_prediction()

        mock_generator = MagicMock(spec=TextGeneratorModule)
        mock_generator.return_value = _generator_prediction()

        mock_image = MagicMock(spec=ImagePrompterModule)
        mock_image.return_value = _image_prediction()

        specs = {"BRAND": "HP", "MODEL": "255 G10", "RAM": "16GB"}
        pipeline = PromptyPipeline(
            auditor=mock_auditor,
            generator=mock_generator,
            image_prompter=mock_image,
        )
        pipeline(
            weak_title="HP buen precio",
            weak_description="Notebook en buen estado.",
            weak_attributes={"BRAND": "HP"},
            product_specs=specs,
            trending_keywords=[],
            photo_urls=["https://example.com/photo.jpg"],
            category="notebooks",
        )

        img_kwargs = mock_image.call_args[1]
        assert img_kwargs["product_specs"] is specs

        gen_kwargs = mock_generator.call_args[1]
        assert "product_specs" not in gen_kwargs
