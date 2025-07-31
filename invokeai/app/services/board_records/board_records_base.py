from abc import ABC, abstractmethod
from typing import Optional

from invokeai.app.services.board_records.board_records_common import BoardChanges, BoardRecord, BoardRecordOrderBy
from invokeai.app.services.shared.pagination import OffsetPaginatedResults
from invokeai.app.services.shared.sqlite.sqlite_common import SQLiteDirection


class BoardRecordStorageBase(ABC):
    """Low-level service responsible for interfacing with the board record store."""

    @abstractmethod
    def delete(self, board_id: str, user_id: Optional[str] = None) -> None:
        """Deletes a board record."""
        pass

    @abstractmethod
    def save(
        self,
        board_name: str,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        """Saves a board record."""
        pass

    @abstractmethod
    def get(
        self,
        board_id: str,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        """Gets a board record."""
        pass

    @abstractmethod
    def update(
        self,
        board_id: str,
        changes: BoardChanges,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        """Updates a board record."""
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
    ) -> OffsetPaginatedResults[BoardRecord]:
        """Gets many board records."""
        pass

    @abstractmethod
    def get_all(
        self, order_by: BoardRecordOrderBy, direction: SQLiteDirection, include_archived: bool = False, user_id: Optional[str] = None,
    ) -> list[BoardRecord]:
        """Gets all board records."""
        pass
