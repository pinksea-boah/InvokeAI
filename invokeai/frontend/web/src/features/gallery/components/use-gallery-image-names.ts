import { EMPTY_ARRAY } from 'app/store/constants';
import { useAppSelector, useAppDispatch } from 'app/store/storeHooks';
import { $authToken } from 'app/store/nanostores/authToken';
import { useStore } from '@nanostores/react';
import { selectGetImageNamesQueryArgs } from 'features/gallery/store/gallerySelectors';
import { useGetImageNamesQuery, imagesApi } from 'services/api/endpoints/images';
import { useDebounce } from 'use-debounce';
import { useEffect } from 'react';

const getImageNamesQueryOptions = {
  refetchOnReconnect: true,
  selectFromResult: ({ currentData, isLoading, isFetching }) => ({
    imageNames: currentData?.image_names ?? EMPTY_ARRAY,
    isLoading,
    isFetching,
  }),
} satisfies Parameters<typeof useGetImageNamesQuery>[1];

export const useGalleryImageNames = () => {
  const _queryArgs = useAppSelector(selectGetImageNamesQueryArgs);
  const [queryArgs] = useDebounce(_queryArgs, 300);
  const authToken = useStore($authToken);
  const dispatch = useAppDispatch();

  // 토큰이 설정되면 강제로 API 재호출
  useEffect(() => {
    if (authToken && queryArgs) {
      // 토큰이 설정되면 갤러리 API를 강제로 재호출
      dispatch(imagesApi.util.invalidateTags(['ImageNameList']));
    }
  }, [authToken, queryArgs, dispatch]);

  const { imageNames, isLoading, isFetching } = useGetImageNamesQuery(queryArgs, getImageNamesQueryOptions);

  return { imageNames, isLoading, isFetching, queryArgs };
};
