from typing import Optional
from pydantic import Field

from invokeai.app.util.model_exclude_null import BaseModelExcludeNull


class BoardImage(BaseModelExcludeNull):
    board_id: str = Field(description="The id of the board")
    image_name: str = Field(description="The name of the image")
    user_id: Optional[str] = Field(default=None, description="The user ID for multi-user SaaS support.")
    """The user ID for multi-user SaaS support."""

def deserialize_board_image(board_image_dict: dict) -> BoardImage:
    """Deserializes a board image."""
    board_id = board_image_dict.get("board_id", "unknown")
    image_name = board_image_dict.get("image_name", "unknown")
    user_id = board_image_dict.get("user_id", None)
    return BoardImage(board_id=board_id, image_name=image_name, user_id=user_id)