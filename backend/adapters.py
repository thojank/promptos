"""
Adapter-Pattern: Universal BasePrompt → modell-spezifische Formate
"""

from typing import Dict, Any
from models import BasePrompt


class BaseAdapter:
    model_name: str = "base"

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        raise NotImplementedError


class FluxAdapter(BaseAdapter):
    model_name = "flux"

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        style_parts = []
        if base_prompt.style:
            if base_prompt.style.lighting:
                style_parts.append(base_prompt.style.lighting)
            if base_prompt.style.camera:
                style_parts.append(base_prompt.style.camera)
            if base_prompt.style.film_stock:
                style_parts.append(base_prompt.style.film_stock)
            if base_prompt.style.aesthetics:
                style_parts.extend(base_prompt.style.aesthetics)

        prompt_parts = [
            base_prompt.subject.description,
            *(base_prompt.subject.attributes or []),
            base_prompt.environment.location,
        ]
        if base_prompt.environment.atmosphere:
            prompt_parts.append(base_prompt.environment.atmosphere)
        if base_prompt.environment.weather:
            prompt_parts.append(base_prompt.environment.weather)
        prompt_parts.extend(style_parts)

        return {
            "model": "flux",
            "prompt": ", ".join([p for p in prompt_parts if p]),
            "settings": {
                "aspect_ratio": base_prompt.technical.aspect_ratio if base_prompt.technical else None,
                "seed": base_prompt.technical.seed if base_prompt.technical else None,
                "cfg_scale": base_prompt.technical.cfg_scale if base_prompt.technical else None,
            },
        }


class BananaAdapter(BaseAdapter):
    model_name = "banana-pro"

    def adapt(self, base_prompt: BasePrompt) -> Dict[str, Any]:
        text_parts = [
            base_prompt.subject.description,
            *(base_prompt.subject.attributes or []),
            base_prompt.environment.location,
        ]
        if base_prompt.environment.atmosphere:
            text_parts.append(base_prompt.environment.atmosphere)
        if base_prompt.environment.weather:
            text_parts.append(base_prompt.environment.weather)
        if base_prompt.style:
            if base_prompt.style.lighting:
                text_parts.append(base_prompt.style.lighting)
            if base_prompt.style.camera:
                text_parts.append(base_prompt.style.camera)
            if base_prompt.style.film_stock:
                text_parts.append(base_prompt.style.film_stock)
            if base_prompt.style.aesthetics:
                text_parts.extend(base_prompt.style.aesthetics)

        text = ". ".join([p for p in text_parts if p])

        return {
            "model": "banana-pro",
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": text}],
                }
            ],
        }


def get_adapter(model: str) -> BaseAdapter:
    model_normalized = model.lower().strip()
    if model_normalized in {"flux"}:
        return FluxAdapter()
    if model_normalized in {"banana", "banana-pro", "nano banana", "nano-banana"}:
        return BananaAdapter()
    raise ValueError(f"Unbekanntes Modell: {model}")
