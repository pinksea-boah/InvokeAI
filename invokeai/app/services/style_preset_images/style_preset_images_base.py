from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

from PIL.Image import Image as PILImageType


class StylePresetImageFileStorageBase(ABC):
    """Low-level service responsible for storing and retrieving image files."""

    @abstractmethod
    def get(self, style_preset_id: str) -> PILImageType:
        """Retrieves a style preset image as PIL Image."""
        pass

    @abstractmethod
    def get_path(self, style_preset_id: str, user_id: Optional[str] = None) -> Path:
        """Gets the internal path to a style preset image."""
        pass

    @abstractmethod
    def get_url(self, style_preset_id: str, user_id: Optional[str] = None) -> str | None:
        """Gets the URL to fetch a style preset image."""
        pass

    @abstractmethod
    def save(self, style_preset_id: str, image: PILImageType, user_id: Optional[str] = None) -> None:
        """Saves a style preset image."""
        pass

    @abstractmethod
    def delete(self, style_preset_id: str, user_id: Optional[str] = None) -> None:
        """Deletes a style preset image."""
        pass
