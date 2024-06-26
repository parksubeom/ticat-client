//react
import { FormEventHandler, useEffect, useState } from 'react';
//types
import { CommentResponse, MyCommentResponse } from 'types/api';
//install library
import styled from 'styled-components';
//hooks
import useResizeTextarea from '@hooks/useResizeTextArea';
import useCustomToast from '@hooks/useCustomToast';
import { useCreateComment } from '@hooks/query/useCreateComment';
import { useUpdateComment } from '@hooks/query/useUpdateComment';
import { useFocusAndScroll } from '@hooks/useFocusAndScroll';

//store
import { useMemberStore } from '@store/useMemberStore';
import { contentBrtoNewLines, convertNewLinesToBr } from '@utils/convertLine';

interface Props {
  festivalId: number;
  reviewId: number;
  comment?: CommentResponse | MyCommentResponse;
  isShow: boolean;
  setIsShowForm?: () => void;
  onCancel?: () => void;
  onSubmit?: (updatedContent: string) => void;
  isEditMode?: boolean;
}

/** 2023/08/06- 댓글 작성 폼 - by leekoby */
const CommentEditorForm: React.FC<Props> = ({
  festivalId,
  reviewId,
  comment,
  isShow,
  onCancel,
  onSubmit,
  setIsShowForm,
  isEditMode = false,
}): JSX.Element => {
  const { member } = useMemberStore();
  const toast = useCustomToast();
  const [inputContent, setInputContent] = useState<string>(isEditMode ? contentBrtoNewLines(comment?.content) : '');

  const [textareaRef, handleResizeHeight] = useResizeTextarea();

  useEffect(() => {
    if (isEditMode && handleResizeHeight) {
      handleResizeHeight();
    }
  }, [isEditMode, handleResizeHeight]);

  const [isFocused, setIsFocused] = useState(false);

  useFocusAndScroll(textareaRef, isShow);

  const handleReset = () => {
    setInputContent('');
  };

  const createCommentMutation = useCreateComment({ festivalId, reviewId, handleReset });
  const updateCommentMutation = useUpdateComment({ commentId: comment?.reviewCommentId, reviewId, handleReset });

  /** 2023/08/07 - 댓글 등록 - by leekoby */
  /** 2023/08/13 - 댓글 수정 등록 - by leekoby */
  const onSubmitComment: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    if (!member) return toast({ title: '로그인후에 접근해주세요!', status: 'error' });
    if (!inputContent.trim().length) return toast({ title: '댓글 내용을 입력해주세요!', status: 'warning' });

    const convertedContent = convertNewLinesToBr(inputContent);

    //댓글 수정
    if (isEditMode && comment?.reviewCommentId) {
      if (comment.content === convertedContent)
        return toast({
          title: '변경된 내용이 없습니다.',
          description: '수정 후 다시 시도해주세요.',
          status: 'warning',
        });
      updateCommentMutation.mutate({ commentId: comment.reviewCommentId, content: convertedContent });
      onSubmit && onSubmit(convertedContent);
      setIsShowForm?.();
      return;
    }

    //댓글 작성
    createCommentMutation.mutate({
      reviewId,
      content: convertedContent,
    });
    setIsShowForm?.();
  };

  return (
    <CommentFormContainer isShow={isShow}>
      <CommentFormBox isFocused={isFocused}>
        <form onSubmit={onSubmitComment}>
          <CommentContentBox>
            <div className="content-input">
              <textarea
                ref={textareaRef}
                value={inputContent}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={e => {
                  setInputContent(e.target.value);
                  handleResizeHeight();
                }}
                placeholder="댓글을 입력해주세요."
              />
            </div>
            <CommentContentBox>
              <div className="content-bottom">
                <p>부적절한 내용은 삭제될 수 있습니다.</p>
                <div className="content-button">
                  <button type="submit" className="post-button">
                    {isEditMode ? '댓글 수정' : '댓글 등록'}
                  </button>
                  {isEditMode ? (
                    <button type="button" className="post-button" onClick={onCancel}>
                      취소
                    </button>
                  ) : (
                    <button type="button" className="post-button" onClick={setIsShowForm}>
                      취소
                    </button>
                  )}
                </div>
              </div>
            </CommentContentBox>
          </CommentContentBox>
        </form>
      </CommentFormBox>
    </CommentFormContainer>
  );
};

export default CommentEditorForm;

const CommentFormContainer = styled.section<{ isShow: boolean }>`
  height: 100%;
  width: 100%;
  opacity: ${({ isShow }: { isShow: boolean }) => (isShow ? 1 : 0)};
  max-height: ${({ isShow }: { isShow: boolean }) => (isShow ? '500px' : '0')};
  overflow: hidden;
  transition: ${({ isShow }: { isShow: boolean }) => (isShow ? 'all 0.5s ease-in-out' : 0)};
`;
const CommentFormBox = styled.div<{ isFocused: boolean }>`
  border: 1px solid ${({ isFocused }) => (isFocused ? 'var(--color-sub)' : 'var(--color-light-gray)')};
  border-radius: 1.2rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 15px;

  .review-rating {
    padding: 0.5rem;
    display: flex;
    gap: 3px;

    > button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
  }
`;
const CommentContentBox = styled.div`
  .content-input {
    textarea {
      resize: none;
      margin-bottom: 1rem;
      border: none;
      width: 100%;
      outline: none;
      background-color: transparent;
    }
  }
  .content-bottom {
    padding: 0.5rem;
    gap: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: end;
    p {
      font-size: 1rem;
      color: var(--color-dark-gray);
    }
    .content-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      label {
        cursor: pointer;
        padding: 0;
        margin: 0;
        button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
        }
      }
      button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        outline: none;
      }
      .post-button {
        white-space: nowrap;

        height: 28px;
        border-radius: 0.5rem;
        padding: 0px 1.2rem;
        font-size: 1.4rem;
        font-weight: bold;
        color: var(--color-light);
        background-color: var(--color-main);

        transition: background-color 0.3s, color 0.3s;

        /* 호버 효과  */
        &:hover {
          background-color: var(--color-sub);
        }
        /* 눌렀을 때 효과  */
        &:active {
          background-color: var(--color-sub);
        }
      }
    }
  }
`;
