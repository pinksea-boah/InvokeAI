import sqlite3
from typing import Union, cast, Optional

from invokeai.app.services.board_records.board_records_base import BoardRecordStorageBase
from invokeai.app.services.board_records.board_records_common import (
    BoardChanges,
    BoardRecord,
    BoardRecordDeleteException,
    BoardRecordNotFoundException,
    BoardRecordOrderBy,
    BoardRecordSaveException,
    deserialize_board_record,
)
from invokeai.app.services.shared.pagination import OffsetPaginatedResults
from invokeai.app.services.shared.sqlite.sqlite_common import SQLiteDirection
from invokeai.app.services.shared.sqlite.sqlite_database import SqliteDatabase
from invokeai.app.util.misc import uuid_string


class SqliteBoardRecordStorage(BoardRecordStorageBase):
    def __init__(self, db: SqliteDatabase) -> None:
        super().__init__()
        self._db = db

    def delete(self, board_id: str, user_id: Optional[str] = None) -> None:
        with self._db.transaction() as cursor:
            try:
                cursor.execute(
                    """--sql
                    DELETE FROM boards
                    WHERE board_id = ? AND user_id = ?;
                    """,
                    (board_id, user_id),
                )
            except Exception as e:
                raise BoardRecordDeleteException from e

    def save(
        self,
        board_name: str,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        with self._db.transaction() as cursor:
            try:
                board_id = uuid_string()
                cursor.execute(
                    """--sql
                    INSERT OR IGNORE INTO boards (board_id, board_name, user_id)
                    VALUES (?, ?, ?);
                    """,
                    (board_id, board_name, user_id),
                )
            except sqlite3.Error as e:
                raise BoardRecordSaveException from e
        return self.get(board_id, user_id)

    def get(
        self,
        board_id: str,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        with self._db.transaction() as cursor:
            try:
                cursor.execute(
                    """--sql
                    SELECT *
                    FROM boards
                    WHERE board_id = ? AND user_id = ?;
                    """,
                    (board_id, user_id),
                )

                result = cast(Union[sqlite3.Row, None], cursor.fetchone())
            except sqlite3.Error as e:
                raise BoardRecordNotFoundException from e
        if result is None:
            raise BoardRecordNotFoundException
        return BoardRecord(**dict(result))

    def update(
        self,
        board_id: str,
        changes: BoardChanges,
        user_id: Optional[str] = None,
    ) -> BoardRecord:
        with self._db.transaction() as cursor:
            try:
                # Change the name of a board
                if changes.board_name is not None:
                    cursor.execute(
                        """--sql
                        UPDATE boards
                        SET board_name = ?
                        WHERE board_id = ? AND user_id = ?;
                        """,
                        (changes.board_name, board_id, user_id),
                    )

                # Change the cover image of a board
                if changes.cover_image_name is not None:
                    cursor.execute(
                        """--sql
                        UPDATE boards
                        SET cover_image_name = ?
                        WHERE board_id = ? AND user_id = ?;
                        """,
                        (changes.cover_image_name, board_id, user_id),
                    )

                # Change the archived status of a board
                if changes.archived is not None:
                    cursor.execute(
                        """--sql
                        UPDATE boards
                        SET archived = ?
                        WHERE board_id = ? AND user_id = ?;
                        """,
                        (changes.archived, board_id, user_id),
                    )

            except sqlite3.Error as e:
                raise BoardRecordSaveException from e
        return self.get(board_id)

    def get_many(
        self,
        order_by: BoardRecordOrderBy,
        direction: SQLiteDirection,
        offset: int = 0,
        limit: int = 10,
        include_archived: bool = False,
        user_id: Optional[str] = None,
    ) -> OffsetPaginatedResults[BoardRecord]:
        with self._db.transaction() as cursor:
            # Build base query
            base_query = """
                    SELECT *
                    FROM boards
                    {where_clause}
                    ORDER BY {order_by} {direction}
                    LIMIT ? OFFSET ?;
                """

            # Determine where clause
            if include_archived:
                where_clause = "WHERE user_id = ?"
            else:
                where_clause = "WHERE archived = 0 AND user_id = ?"

            final_query = base_query.format(
                where_clause=where_clause, order_by=order_by.value, direction=direction.value
            )

            # Execute query to fetch boards
            cursor.execute(final_query, (user_id, limit, offset))

            result = cast(list[sqlite3.Row], cursor.fetchall())
            boards = [deserialize_board_record(dict(r)) for r in result]

            # Determine count query
            if include_archived:
                count_query = """
                        SELECT COUNT(*)
                        FROM boards
                        WHERE user_id = ?;
                    """
            else:
                count_query = """
                        SELECT COUNT(*)
                        FROM boards
                        WHERE archived = 0 AND user_id = ?;
                    """

            # Execute count query
            cursor.execute(count_query, (user_id,))

            count = cast(int, cursor.fetchone()[0])

        return OffsetPaginatedResults[BoardRecord](items=boards, offset=offset, limit=limit, total=count)

    def get_all(
        self, order_by: BoardRecordOrderBy, direction: SQLiteDirection, include_archived: bool = False, user_id: Optional[str] = None,
    ) -> list[BoardRecord]:
        with self._db.transaction() as cursor:
            if order_by == BoardRecordOrderBy.Name:
                base_query = """
                        SELECT *
                        FROM boards
                        {where_clause}
                        ORDER BY LOWER(board_name) {direction}
                    """
            else:
                base_query = """
                        SELECT *
                        FROM boards
                        {where_clause}
                        ORDER BY {order_by} {direction}
                    """

            if include_archived:
                where_clause = "WHERE user_id = ?"
            else:
                where_clause = "WHERE archived = 0 AND user_id = ?"

            final_query = base_query.format(
                where_clause=where_clause, order_by=order_by.value, direction=direction.value
            )

            cursor.execute(final_query, (user_id,))

            result = cast(list[sqlite3.Row], cursor.fetchall())
        boards = [deserialize_board_record(dict(r)) for r in result]

        return boards
