from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

from PIL import Image


class WorkflowThumbnailServiceBase(ABC):
    """Base class for workflow thumbnail services"""

    @abstractmethod
    def get_path(self, workflow_id: str, with_hash: bool = True, user_id: Optional[str] = None) -> Path:
        """Gets the path to a workflow thumbnail"""
        pass

    @abstractmethod
    def get_url(self, workflow_id: str, with_hash: bool = True, user_id: Optional[str] = None) -> str | None:
        """Gets the URL of a workflow thumbnail"""
        pass

    @abstractmethod
    def save(self, workflow_id: str, image: Image.Image, user_id: Optional[str] = None) -> None:
        """Saves a workflow thumbnail"""
        pass

    @abstractmethod
    def delete(self, workflow_id: str, user_id: Optional[str] = None) -> None:
        """Deletes a workflow thumbnail"""
        pass
