import io
from pathlib import Path
from typing import Optional, Union
from minio import Minio
from PIL import Image, PngImagePlugin
from PIL.Image import Image as PILImageType

from invokeai.app.services.image_files.image_files_base import ImageFileStorageBase
from invokeai.app.services.image_files.image_files_common import (
    ImageFileDeleteException,
    ImageFileNotFoundException,
    ImageFileSaveException,
)
from invokeai.app.services.invoker import Invoker
from invokeai.app.util.thumbnails import get_thumbnail_name, make_thumbnail


class MinIOImageFileStorage(ImageFileStorageBase):
    """Stores images on MinIO"""

    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket_name: str, secure: bool = False):
        self.__client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.__bucket_name = bucket_name
        self.__cache: dict[str, PILImageType] = {}
        self.__max_cache_size = 10
        
        # 버킷이 없으면 생성
        if not self.__client.bucket_exists(bucket_name):
            self.__client.make_bucket(bucket_name)

    def start(self, invoker: Invoker) -> None:
        self.__invoker = invoker

    def get(self, image_name: str, user_id: Optional[str] = None) -> PILImageType:
        try:
            if image_name in self.__cache:
                return self.__cache[image_name]
                
            response = self.__client.get_object(self.__bucket_name, f"images/{image_name}")
            image = Image.open(io.BytesIO(response.data))
            self.__cache[image_name] = image
            return image
        except Exception as e:
            raise ImageFileNotFoundException from e

    def save(
        self,
        image: PILImageType,
        image_name: str,
        metadata: Optional[str] = None,
        workflow: Optional[str] = None,
        graph: Optional[str] = None,
        thumbnail_size: int = 256,
        user_id: Optional[str] = None,
    ) -> None:
        try:
            # PNG 정보 준비
            pnginfo = PngImagePlugin.PngInfo()
            info_dict = {}

            if metadata is not None:
                info_dict["invokeai_metadata"] = metadata
                pnginfo.add_text("invokeai_metadata", metadata)
            if workflow is not None:
                info_dict["invokeai_workflow"] = workflow
                pnginfo.add_text("invokeai_workflow", workflow)
            if graph is not None:
                info_dict["invokeai_graph"] = graph
                pnginfo.add_text("invokeai_graph", graph)

            image.info = info_dict

            # 이미지를 메모리 버퍼에 저장
            buffer = io.BytesIO()
            image.save(
                buffer,
                "PNG",
                pnginfo=pnginfo,
                compress_level=self.__invoker.services.configuration.pil_compress_level,
            )
            buffer.seek(0)

            # MinIO에 업로드
            self.__client.put_object(
                self.__bucket_name,
                f"images/{image_name}",
                buffer,
                length=buffer.getbuffer().nbytes,
                content_type="image/png"
            )

            # 썸네일 생성 및 업로드
            thumbnail_name = get_thumbnail_name(image_name)
            thumbnail_image = make_thumbnail(image, thumbnail_size)
            thumb_buffer = io.BytesIO()
            thumbnail_image.save(thumb_buffer, format="WEBP")
            thumb_buffer.seek(0)

            self.__client.put_object(
                self.__bucket_name,
                f"thumbnails/{thumbnail_name}",
                thumb_buffer,
                length=thumb_buffer.getbuffer().nbytes,
                content_type="image/webp"
            )

            self.__cache[image_name] = image
        except Exception as e:
            raise ImageFileSaveException from e

    def delete(self, image_name: str, user_id: Optional[str] = None) -> None:
        try:
            self.__client.remove_object(self.__bucket_name, f"images/{image_name}")
            
            thumbnail_name = get_thumbnail_name(image_name)
            self.__client.remove_object(self.__bucket_name, f"thumbnails/{thumbnail_name}")
            
            if image_name in self.__cache:
                del self.__cache[image_name]
        except Exception as e:
            raise ImageFileDeleteException from e

    def get_content(self, image_name: str, thumbnail: bool = False, user_id: Optional[str] = None) -> bytes:
        """MinIO에서 이미지 파일 내용을 바이트로 반환"""
        try:
            if thumbnail:
                thumbnail_name = get_thumbnail_name(image_name)
                object_path = f"thumbnails/{thumbnail_name}"
            else:
                object_path = f"images/{image_name}"
            
            response = self.__client.get_object(self.__bucket_name, object_path)
            content = response.read()
            response.close()
            response.release_conn()
            return content
        except Exception as e:
            raise ImageFileNotFoundException from e

    def get_path(self, image_name: str, thumbnail: bool = False, user_id: Optional[str] = None) -> Path:
        # MinIO의 경우 실제 파일 경로가 없으므로 가상 경로 반환
        if thumbnail:
            return Path(f"minio://{self.__bucket_name}/thumbnails/{get_thumbnail_name(image_name)}")
        return Path(f"minio://{self.__bucket_name}/images/{image_name}")

    def validate_path(self, path: Union[str, Path], user_id: Optional[str] = None) -> bool:
        # MinIO 객체 존재 여부 확인
        path_str = str(path)
        if path_str.startswith("minio://"):
            object_name = path_str.split(f"minio://{self.__bucket_name}/", 1)[1]
            try:
                self.__client.stat_object(self.__bucket_name, object_name)
                return True
            except:
                return False
        return False

    def get_workflow(self, image_name: str, user_id: Optional[str] = None) -> str | None:
        image = self.get(image_name, user_id)
        workflow = image.info.get("invokeai_workflow", None)
        if isinstance(workflow, str):
            return workflow
        return None

    def get_graph(self, image_name: str, user_id: Optional[str] = None) -> str | None:
        image = self.get(image_name, user_id)
        graph = image.info.get("invokeai_graph", None)
        if isinstance(graph, str):
            return graph
        return None 