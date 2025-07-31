import sqlite3

from invokeai.app.services.shared.sqlite_migrator.sqlite_migrator_common import Migration


class Migration21Callback:
    """Add user_id columns for SaaS multi-user support."""
    
    def __call__(self, cursor: sqlite3.Cursor) -> None:
        self._add_user_id_to_images(cursor)
        self._add_user_id_to_session_queue(cursor)
        self._add_user_id_to_boards(cursor)
        self._add_user_id_to_workflow_library(cursor)
        self._add_user_id_to_board_images(cursor)
        self._add_user_id_to_style_presets(cursor)

    def _add_user_id_to_images(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to images table."""
        # Check if column already exists
        cursor.execute("PRAGMA table_info(images)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE images ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_images_user_id_created_at ON images(user_id, created_at);")

    def _add_user_id_to_session_queue(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to session_queue table."""
        cursor.execute("PRAGMA table_info(session_queue)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE session_queue ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_session_queue_user_id ON session_queue(user_id);")

    def _add_user_id_to_boards(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to boards table."""
        cursor.execute("PRAGMA table_info(boards)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE boards ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);")

    def _add_user_id_to_workflow_library(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to workflow_library table."""
        cursor.execute("PRAGMA table_info(workflow_library)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE workflow_library ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_workflow_library_user_id ON workflow_library(user_id);")

    def _add_user_id_to_board_images(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to board_images table."""
        cursor.execute("PRAGMA table_info(board_images)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE board_images ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_board_images_user_id ON board_images(user_id);")

    def _add_user_id_to_style_presets(self, cursor: sqlite3.Cursor) -> None:
        """Add user_id column to style_presets table."""
        cursor.execute("PRAGMA table_info(style_presets)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            cursor.execute("ALTER TABLE style_presets ADD COLUMN user_id TEXT;")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_style_presets_user_id ON style_presets(user_id);")


def build_migration_21() -> Migration:
    """
    Builds the migration from database version 20 to 21.
    
    This migration adds user_id columns to support multi-user SaaS functionality:
    - Add user_id column to images table
    - Add user_id column to session_queue table  
    - Add user_id column to boards table
    - Add user_id column to workflow_library table
    - Add user_id column to board_images table
    - Add user_id column to style_presets table
    - Add appropriate indexes for performance
    """
    migration_21 = Migration(
        from_version=20,
        to_version=21,
        callback=Migration21Callback(),
    )
    
    return migration_21 