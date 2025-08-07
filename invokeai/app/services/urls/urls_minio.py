import os
from typing import Optional
from datetime import timedelta

from invokeai.app.services.urls.urls_base import UrlServiceBase


class MinIOUrlService(UrlServiceBase):
    def __init__(self, minio_endpoint: str = "http://localhost:9000", bucket_name: str = "pinksea-dev-images", 
                 access_key: str = "minioadmin", secret_key: str = "minioadmin"):
        self._minio_endpoint = minio_endpoint
        self._bucket_name = bucket_name
        self._access_key = access_key
        self._secret_key = secret_key
        self._client = None

    def _get_client(self):
        """MinIO 클라이언트를 가져옵니다"""
        if self._client is None:
            from minio import Minio
            self._client = Minio(
                self._minio_endpoint.replace("http://", "").replace("https://", ""),
                access_key=self._access_key,
                secret_key=self._secret_key,
                secure=self._minio_endpoint.startswith("https://")
            )
        return self._client

    def get_image_url(self, image_name: str, thumbnail: bool = False, user_id: Optional[str] = None) -> str:
        image_basename = os.path.basename(image_name)

        # Docker 환경에서는 API를 통해 이미지 제공
        # 프론트엔드에서 MinIO에 직접 접근할 수 없으므로
        if thumbnail:
            return f"api/v1/images/i/{image_basename}/thumbnail"
        return f"api/v1/images/i/{image_basename}/full"

    def get_model_image_url(self, model_key: str) -> str:
        # 모델 이미지는 여전히 API를 통해 제공
        return f"api/v2/models/i/{model_key}/image"

    def get_style_preset_image_url(self, style_preset_id: str) -> str:
        # 스타일 프리셋 이미지는 여전히 API를 통해 제공
        return f"api/v1/style_presets/i/{style_preset_id}/image"

    def get_workflow_thumbnail_url(self, workflow_id: str, user_id: Optional[str] = None) -> str:
        # 워크플로우 썸네일은 여전히 API를 통해 제공
        return f"api/v1/workflows/i/{workflow_id}/thumbnail" 