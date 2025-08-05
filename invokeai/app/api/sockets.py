# Copyright (c) 2022 Kyle Schouviller (https://github.com/kyle0654)

from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel
from socketio import ASGIApp, AsyncServer

from invokeai.app.services.events.events_common import (
    BatchEnqueuedEvent,
    BulkDownloadCompleteEvent,
    BulkDownloadErrorEvent,
    BulkDownloadEventBase,
    BulkDownloadStartedEvent,
    DownloadCancelledEvent,
    DownloadCompleteEvent,
    DownloadErrorEvent,
    DownloadEventBase,
    DownloadProgressEvent,
    DownloadStartedEvent,
    FastAPIEvent,
    InvocationCompleteEvent,
    InvocationErrorEvent,
    InvocationProgressEvent,
    InvocationStartedEvent,
    ModelEventBase,
    ModelInstallCancelledEvent,
    ModelInstallCompleteEvent,
    ModelInstallDownloadProgressEvent,
    ModelInstallDownloadsCompleteEvent,
    ModelInstallErrorEvent,
    ModelInstallStartedEvent,
    ModelLoadCompleteEvent,
    ModelLoadStartedEvent,
    QueueClearedEvent,
    QueueEventBase,
    QueueItemStatusChangedEvent,
    register_events,
)


class QueueSubscriptionEvent(BaseModel):
    """Event data for subscribing to the socket.io queue room.
    This is a pydantic model to ensure the data is in the correct format."""

    queue_id: str


class BulkDownloadSubscriptionEvent(BaseModel):
    """Event data for subscribing to the socket.io bulk downloads room.
    This is a pydantic model to ensure the data is in the correct format."""

    bulk_download_id: str


QUEUE_EVENTS = {
    InvocationStartedEvent,
    InvocationProgressEvent,
    InvocationCompleteEvent,
    InvocationErrorEvent,
    QueueItemStatusChangedEvent,
    BatchEnqueuedEvent,
    QueueClearedEvent,
}

MODEL_EVENTS = {
    DownloadCancelledEvent,
    DownloadCompleteEvent,
    DownloadErrorEvent,
    DownloadProgressEvent,
    DownloadStartedEvent,
    ModelLoadStartedEvent,
    ModelLoadCompleteEvent,
    ModelInstallDownloadProgressEvent,
    ModelInstallDownloadsCompleteEvent,
    ModelInstallStartedEvent,
    ModelInstallCompleteEvent,
    ModelInstallCancelledEvent,
    ModelInstallErrorEvent,
}

BULK_DOWNLOAD_EVENTS = {BulkDownloadStartedEvent, BulkDownloadCompleteEvent, BulkDownloadErrorEvent}

async def _on_connect(sid, environ):
    print(f"🔌 Client connected: {sid}")
    return True
class SocketIO:
    _sub_queue = "subscribe_queue"
    _unsub_queue = "unsubscribe_queue"

    _sub_bulk_download = "subscribe_bulk_download"
    _unsub_bulk_download = "unsubscribe_bulk_download"

    def __init__(self, app: FastAPI):
        self._sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*")
        self._app = ASGIApp(socketio_server=self._sio, socketio_path="/ws/socket.io")
        app.mount("/ws", self._app)

        print(f"🔧 Registering socket handlers: {self._sub_queue}, {self._unsub_queue}")
        self._sio.on(self._sub_queue, handler=self._handle_sub_queue)
        self._sio.on(self._unsub_queue, handler=self._handle_unsub_queue)
        self._sio.on(self._sub_bulk_download, handler=self._handle_sub_bulk_download)
        self._sio.on(self._unsub_bulk_download, handler=self._handle_unsub_bulk_download)

        self._sio.on("connect", _on_connect)

        register_events(QUEUE_EVENTS, self._handle_queue_event)
        register_events(MODEL_EVENTS, self._handle_model_event)
        register_events(BULK_DOWNLOAD_EVENTS, self._handle_bulk_image_download_event)
    
    # async def _handle_disconnect(self, sid: str) -> None:
    #     print(f"🔌 Client disconnected: {sid}")

    async def _handle_sub_queue(self, sid: str, data: Any) -> None:
        print(f"📡 _handle_sub_queue called with sid: {sid}, data: {data}")
        try:
            queue_id = QueueSubscriptionEvent(**data).queue_id
            print(f"📡 Client {sid} subscribing to queue: {queue_id}")
            await self._sio.enter_room(sid, queue_id)
            print(f"📡 Client {sid} successfully joined room: {queue_id}")
        except Exception as e:
            print(f"❌ Error in _handle_sub_queue: {e}")
            import traceback
            traceback.print_exc()

    async def _handle_unsub_queue(self, sid: str, data: Any) -> None:
        await self._sio.leave_room(sid, QueueSubscriptionEvent(**data).queue_id)

    async def _handle_sub_bulk_download(self, sid: str, data: Any) -> None:
        await self._sio.enter_room(sid, BulkDownloadSubscriptionEvent(**data).bulk_download_id)

    async def _handle_unsub_bulk_download(self, sid: str, data: Any) -> None:
        await self._sio.leave_room(sid, BulkDownloadSubscriptionEvent(**data).bulk_download_id)

    async def _handle_queue_event(self, event: FastAPIEvent[QueueEventBase]):
        # 디버깅: 웹소켓 이벤트 라우팅 로깅
        room = event[1].queue_id
        print(f"📡 WebSocket Event: {event[0]} -> Room: {room}")
        
        await self._sio.emit(event=event[0], data=event[1].model_dump(mode="json"), room=room)
        print(f"📡 Event {event[0]} sent to room {room}")

    async def _handle_model_event(self, event: FastAPIEvent[ModelEventBase | DownloadEventBase]) -> None:
        await self._sio.emit(event=event[0], data=event[1].model_dump(mode="json"))

    async def _handle_bulk_image_download_event(self, event: FastAPIEvent[BulkDownloadEventBase]) -> None:
        await self._sio.emit(event=event[0], data=event[1].model_dump(mode="json"), room=event[1].bulk_download_id)
