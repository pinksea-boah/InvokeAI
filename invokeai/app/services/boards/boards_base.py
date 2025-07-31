from abc import ABC, abstractmethod
from typing import Optional

from invokeai.app.services.board_records.board_records_common import BoardChanges, BoardRecordOrderBy
from invokeai.app.services.boards.boards_common import BoardDTO
from invokeai.app.services.shared.pagination import OffsetPaginatedResults
from invokeai.app.services.shared.sqlite.sqlite_common import SQLiteDirection


class BoardServiceABC(ABC):
    """High-level service for board management."""

    @abstractmethod
    def create(
        self,
        board_name: str,
        user_id: Optional[str] = None,
    ) -> BoardDTO:
        """Creates a board."""
        pass

    @abstractmethod
    def get_dto(
        self,
        board_id: str,
        user_id: Optional[str] = None,
    ) -> BoardDTO:
        """Gets a board."""
        pass

    @abstractmethod
    def update(
        self,
        board_id: str,
        changes: BoardChanges,
        user_id: Optional[str] = None,
    ) -> BoardDTO:
        """Updates a board."""
        pass

    @abstractmethod
    def delete(
        self,
        board_id: str,
        user_id: Optional[str] = None,
    ) -> None:
        """Deletes a board."""
        pass

    @abstractmethod
    def get_many(
        self,
        order_by: BoardRecordOrderBy,
        direction: SQLiteDirection,
        offset: int = 0,
        limit: int = 10,
        include_archived: bool = False,
        user_id: Optional[str] = None,
    ) -> OffsetPaginatedResults[BoardDTO]:
        """Gets many boards."""
        pass

    @abstractmethod
    def get_all(
        self, order_by: BoardRecordOrderBy, direction: SQLiteDirection, include_archived: bool = False, user_id: Optional[str] = None,
    ) -> list[BoardDTO]:
        """Gets all boards."""
        pass
