import React, { FC, useState, useCallback, useEffect } from "react";
import css from "../styles/Dashboard.module.scss";
import {
  Snackbar,
  Alert,
  Checkbox,
  Autocomplete,
  TextField,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  AdditionalQuestionClass,
  ChoiceClass,
  PersonalInfoClass,
  ProfileClass,
} from "../utils/utils";
import CustomSwitch from "./CustomSwitch";
import {
  AttributesReducerType,
  PersonalInformationType,
  ProfileType,
  QuestionSubComponentPropsType,
  QuestionTypes,
  SelectorType,
} from "../types";
import { useInput, useForm } from "use-manage-form";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { attributeActions } from "../store/store";
import { createPortal } from "react-dom";
import { fetchDetaisAction, updateDetaisAction } from "../store/attributeSlice";
import { AnyAction } from "@reduxjs/toolkit";

const Section: React.FC<{
  title: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  return (
    <>
      <section
        className={`${css.each_dashboard_section} ${
          className ? className : null
        }`}
      >
        <div className={css.title}>{title}</div>
        <div className={css.content}>{children}</div>
      </section>
    </>
  );
};

const UploadCoverImageSection: FC<{
  existingImage?: string;
}> = ({ existingImage }) => {
  const dispatch = useDispatch();
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    undefined
  );
  const [fileUploadError, setFileUploadError] = useState<{
    state: boolean;
    message: string | undefined;
  }>({ state: false, message: undefined });

  const displayFileUploadError = (message: string, seconds?: number) => {
    setFileUploadError({ state: true, message });

    setTimeout(
      () => setFileUploadError({ state: false, message: undefined }),
      1000 * (seconds || 6)
    );
  };

  const uploadFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    const availableExtentions = ["png", "jpg", "jpeg", "gif", "bmp"];
    const fileExt = file.name.split(".")?.slice(-1)?.[0];

    if (!availableExtentions.includes(fileExt.toLowerCase())) {
      return displayFileUploadError(
        `Uploaded file must be a valid image with one of the following extentions: ${availableExtentions.join(
          ", "
        )}`
      );
    }
    if (file.size > 1024 * 1024) {
      return displayFileUploadError("Uploaded file size must not exceed 1mb");
    }

    const imageBlob = URL.createObjectURL(file);
    setUploadedImage(imageBlob);
    dispatch(attributeActions.uploadCoverImage(imageBlob));
    setFileUploadError({ state: false, message: undefined });
  };

  const removeUploadedImage = () => {
    setUploadedImage(undefined);
    dispatch(attributeActions.uploadCoverImage(""));
  };

  const resetFileUploadError = () => {
    setFileUploadError({ state: false, message: undefined });
  };
  return (
    <>
      <Section title="Upload cover image" className={css.upload_cover_image}>
        {uploadedImage || existingImage ? (
          <div className={css.img_container}>
            <img src={uploadedImage || existingImage} alt="cover image" />
            <i
              className="fas fa-trash"
              onClick={() => removeUploadedImage()}
            ></i>
          </div>
        ) : (
          <>
            <label className={css.upload_area} htmlFor="cover_image">
              <span>Upload cover image</span>
              <span>16:9 ratio is recommended. Max size is 1mb</span>
              <input
                type="file"
                hidden
                id="cover_image"
                onChange={uploadFile}
              />
            </label>
          </>
        )}
      </Section>
      {fileUploadError.state && (
        <Snackbar
          open={fileUploadError.state}
          autoHideDuration={1000 * 6}
          onClose={resetFileUploadError}
        >
          <Alert severity="error" onClose={resetFileUploadError}>
            {fileUploadError.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

const EachPersonalInfo: FC<{
  info: PersonalInfoClass;
  name: string;
  index: number;
  allFieldsLength: number;
}> = ({ info, index, name, allFieldsLength }) => {
  const uniqueKeys = [
    "First Name",
    "Last Name",
    "Email",
    "firstName",
    "lastName",
    "emailId",
  ];

  const [internalUse, setInternalUse] = useState(
    Object.values(info)[0]?.internalUse
  );
  const [showField, setShowField] = useState(Object.values(info)[0]?.show);
  const dispatch = useDispatch();

  const internalUseChangeHandler = (state: boolean) => {
    setInternalUse(state);
    dispatch(
      attributeActions.editPersonalInformation({
        key: name,
        options: { internalUse: state },
      })
    );
  };

  const showInputChangeHandler = (state: boolean) => {
    setShowField(state);
    dispatch(
      attributeActions.editPersonalInformation({
        key: name,
        options: { show: state },
      })
    );
  };

  useEffect(() => {
    setInternalUse(info?.internalUse);
    setShowField(info?.show);
  }, [info]);

  return (
    <>
      <div className={css.each_personal_info}>
        <span className={css.title}>{name}</span>

        {!uniqueKeys.includes(Object.keys(info)[0]) && (
          <div className={css.action}>
            <label>
              <Checkbox
                checked={internalUse}
                onChange={(e) => internalUseChangeHandler(e.target.checked)}
                inputProps={{ "aria-label": "controlled" }}
                sx={{
                  color: "#00635b",
                  "&.Mui-checked": {
                    color: "#00635b",
                  },
                }}
              />{" "}
              Internal
            </label>
            <label>
              <CustomSwitch
                checked={showField}
                onChange={(e) => showInputChangeHandler(e.target.checked)}
                styles={{ checkedColor: "#00635b" }}
                inputProps={{ "aria-label": "controlled" }}
              />{" "}
              {showField ? "Show" : "Hide"}
            </label>
          </div>
        )}
      </div>
      {index < allFieldsLength - 1 && <hr />}
    </>
  );
};

const AddPersonalInfoQuestion: FC = () => {
  const [displayAddQuestion, setDisplayAddQuestion] = useState(false);
  const closeQuestion = () => {
    setDisplayAddQuestion(false);
  };
  const openQuestion = () => {
    setDisplayAddQuestion(true);
  };

  return (
    <>
      <div className={css.add_personal_info_question}>
        {displayAddQuestion ? (
          <QuestionComponent
            closeQUestionSection={closeQuestion}
            action={attributeActions.addPersonalQuestion}
          />
        ) : (
          <span className={css.add_question_btn} onClick={openQuestion}>
            <i className="fas fa-plus" /> <span>Add question</span>
          </span>
        )}
      </div>
    </>
  );
};

const PersonalInformationSection: FC<{
  personalInformationFields: PersonalInformationType;
}> = ({ personalInformationFields }) => {
  return (
    <>
      <Section title="Personal information" className={css.personal_info}>
        {Object.entries(personalInformationFields)
          .filter(([name, info]) => name !== "personalQuestions")
          .map(([name, info], i) => (
            <EachPersonalInfo
              info={info as PersonalInfoClass}
              index={i}
              key={i}
              name={name}
              allFieldsLength={
                Object.entries(personalInformationFields).filter(
                  ([name, info]) => name !== "personalQuestions"
                ).length
              }
            />
          ))}
        {personalInformationFields.personalQuestions.length > 0 && <hr />}
        {personalInformationFields.personalQuestions.map((question, i) => (
          <EachQuestion
            allQuestionslength={
              personalInformationFields.personalQuestions.length
            }
            question={question}
            index={i}
            key={i}
            type="personalInformation"
          />
        ))}
        <AddPersonalInfoQuestion />
      </Section>
    </>
  );
};

const EachProfileInfo: FC<{
  info: ProfileClass;
  name: string;
  index: number;
  allFieldsLength: number;
}> = ({ name, info, index, allFieldsLength }) => {
  const [mandatory, setMandatory] = useState(info?.mandatory);
  const [showField, setShowField] = useState(info.show);

  const dispatch = useDispatch();

  const mandatoryChangeHandler = (state: boolean) => {
    setMandatory(state);
    dispatch(
      attributeActions.editProfile({ key: name, options: { mandatory: state } })
    );
  };

  const showInputChangeHandler = (state: boolean) => {
    setShowField(state);
    dispatch(
      attributeActions.editProfile({ key: name, options: { show: state } })
    );
  };

  useEffect(() => {
    setMandatory(info?.mandatory);
    setShowField(info?.show);
  }, [info]);

  return (
    <>
      <div className={css.each_profile_info}>
        <span className={css.title}>{name}</span>

        <div className={css.action}>
          <label>
            <Checkbox
              checked={mandatory}
              onChange={(e) => mandatoryChangeHandler(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
              sx={{
                color: "#00635b",
                "&.Mui-checked": {
                  color: "#00635b",
                },
              }}
            />{" "}
            Mandatory
          </label>
          <label>
            <CustomSwitch
              checked={showField}
              onChange={(e) => showInputChangeHandler(e.target.checked)}
              styles={{ checkedColor: "#00635b" }}
              inputProps={{ "aria-label": "controlled" }}
            />{" "}
            {showField ? "Show" : "Hide"}
          </label>
        </div>
      </div>
      {index < allFieldsLength - 1 && <hr />}
    </>
  );
};

const AddProfileInfoQuestion: FC = () => {
  const [displayAddQuestion, setDisplayAddQuestion] = useState(false);
  const closeQuestion = () => {
    setDisplayAddQuestion(false);
  };
  const openQuestion = () => {
    setDisplayAddQuestion(true);
  };

  return (
    <>
      <div className={css.add_profile_info_question}>
        {displayAddQuestion ? (
          <QuestionComponent
            closeQUestionSection={closeQuestion}
            action={attributeActions.addProfileQuestion}
          />
        ) : (
          <span className={css.add_question_btn} onClick={openQuestion}>
            <i className="fas fa-plus" /> <span>Add question</span>
          </span>
        )}
      </div>
    </>
  );
};

const ProfileInformationSection: FC<{
  profileInformationFields: ProfileType;
}> = ({ profileInformationFields }) => {
  return (
    <>
      <Section title="Profile" className={css.profile_info}>
        {Object.entries(profileInformationFields)
          .filter(([name, info]) => name !== "profileQuestions")
          .map(([name, info], i) => (
            <EachProfileInfo
              allFieldsLength={
                Object.entries(profileInformationFields).filter(
                  ([name, info]) => name !== "profileQuestions"
                ).length
              }
              info={info as ProfileClass}
              name={name}
              index={i}
              key={i}
            />
          ))}
        {profileInformationFields.profileQuestions.length > 0 && <hr />}
        {profileInformationFields.profileQuestions.map((question, i) => (
          <EachQuestion
            allQuestionslength={
              profileInformationFields.profileQuestions.length
            }
            question={question}
            index={i}
            key={i}
            type="profile"
          />
        ))}

        <AddProfileInfoQuestion />
      </Section>
    </>
  );
};

const EachQuestion: FC<{
  question: AdditionalQuestionClass;
  index: number;
  allQuestionslength: number;
  type: "profile" | "personalInformation" | "customizedQuestion";
}> = ({ question, index, allQuestionslength, type }) => {
  const [displayEditQuestion, setDisplayEditQuestion] = useState(false);
  const closeQuestion = () => {
    setDisplayEditQuestion(false);
  };
  const openQuestion = () => {
    setDisplayEditQuestion(true);
  };

  return (
    <>
      {displayEditQuestion ? (
        <EditQuestionComponent
          closeQUestionSection={closeQuestion}
          editAction={
            type === "personalInformation"
              ? attributeActions.editPersonalQuestion
              : type === "profile"
              ? attributeActions.editProfileQuestion
              : attributeActions.editCustomizedQuestion
          }
          deleteAction={
            type === "personalInformation"
              ? attributeActions.deletePersonalQuestion
              : type === "profile"
              ? attributeActions.deleteProfileQuestion
              : attributeActions.deleteCustomizedQuestion
          }
          existingQuestionDetails={question}
        />
      ) : (
        <div className={css.each_question}>
          <div className={css.wrapper}>
            <div className={css.wrapper_content}>
              <div className={css.type}>{question?.type}</div>
              <div className={css.question}>{question?.question}</div>
            </div>
            <i className="fas fa-pencil" onClick={openQuestion}></i>
          </div>
          {index < allQuestionslength - 1 && <hr />}
        </div>
      )}
    </>
  );
};

const AddAdditionalQuestion: FC = () => {
  const [displayAddQuestion, setDisplayAddQuestion] = useState(false);
  const closeQuestion = () => {
    setDisplayAddQuestion(false);
  };
  const openQuestion = () => {
    setDisplayAddQuestion(true);
  };

  return (
    <>
      <div className={css.add_additional_question}>
        {displayAddQuestion ? (
          <QuestionComponent
            closeQUestionSection={closeQuestion}
            action={attributeActions.addCustomizedQuestion}
          />
        ) : (
          <span className={css.add_question_btn} onClick={openQuestion}>
            <i className="fas fa-plus" /> <span>Add question</span>
          </span>
        )}
      </div>
    </>
  );
};

const AdditionalQuestionsSection: FC<{
  additionalQuestions: AdditionalQuestionClass[];
}> = ({ additionalQuestions }) => {
  return (
    <>
      <Section
        title="Additional questions"
        className={css.additional_questions}
      >
        {additionalQuestions.map((info, i) => (
          <EachQuestion
            allQuestionslength={additionalQuestions.length}
            question={info}
            index={i}
            key={i}
            type="customizedQuestion"
          />
        ))}
        <AddAdditionalQuestion />
      </Section>
    </>
  );
};

const EachChoiceComponent: FC<{
  choices: ChoiceClass[];
  setChoices: React.Dispatch<React.SetStateAction<ChoiceClass[]>>;
  choice: ChoiceClass;
  index: number;
  questionType: QuestionTypes;
}> = ({ choices, setChoices, choice, index, questionType }) => {
  const {
    value: choiceField,
    isValid: choiceFieldIsValid,
    inputIsInValid: choiceFieldInputIsInvalid,
    onChange: onChoiceFieldChange,
    onBlur: onChoiceFieldBlur,
    reset: resetChoiceField,
  } = useInput<string>((value) => (value ? value.trim() !== "" : false));

  const choiceChangeHandler = (value: string, id: string | number) => {
    onChoiceFieldChange(value);
    const oldChoices = [...choices];
    const index = oldChoices.findIndex((choice) => choice.id === id);
    if (index === -1) return;
    oldChoices[index] = new ChoiceClass(oldChoices[index].id, value);
    setChoices([...oldChoices]);
  };
  const addChoice = () => {
    // if (!choiceFieldIsValid) return;
    setChoices((prevChoices) => [
      ...prevChoices,
      new ChoiceClass(prevChoices.length, ""),
    ]);
  };

  useEffect(() => {
    resetChoiceField();
  }, [questionType]);

  useEffect(() => {
    onChoiceFieldChange(choice.choice);
  }, []);

  return (
    <>
      <div className={css.option}>
        <i className="fas fa-list" />
        <TextField
          variant="outlined"
          label="Choice"
          placeholder="Enter choice"
          value={choiceField}
          onChange={(e) => choiceChangeHandler(e.target.value, choice.id)}
          onBlur={onChoiceFieldBlur as any}
          className={css.input}
          // error={choiceFieldInputIsInvalid}
          // helperText={choiceFieldInputIsInvalid && "Input must not be empty"}
        />
        {index === choices.length - 1 && (
          <i
            className="fas fa-add"
            style={
              !choiceFieldIsValid
                ? { pointerEvents: "none", color: "lightgray" }
                : undefined
            }
            onClick={addChoice}
          />
        )}
      </div>
    </>
  );
};

const ChoiceContainerComponent: FC<
  {
    choices: ChoiceClass[];
    setChoices: React.Dispatch<React.SetStateAction<ChoiceClass[]>>;
    questionType: QuestionTypes;
    existingQuestionDetails?: AdditionalQuestionClass;
  } & QuestionSubComponentPropsType
> = ({
  questionType,
  updateQuestionDetails,
  choices,
  setChoices,
  existingQuestionDetails,
}) => {
  const [enableOtherOption, setEnableOtherOption] = useState<boolean>(false);
  const {
    value: maxChoiceAllowed,
    isValid: maxChoiceAllowedIsValid,
    inputIsInValid: maxChoiceAllowedInputIsInvalid,
    onChange: onMaxChoiceAllowedChange,
    onBlur: onMaxChoiceAllowedBlur,
  } = useInput<string>({
    validateFunction: (value) =>
      value ? value.trim() !== "" && !Number.isNaN(value) : false,
    defaultValue: "1",
  });

  const toogleOtherOption = (state: boolean) => {
    setEnableOtherOption(state);
    updateQuestionDetails((prev) => ({ ...prev, other: state }));
  };

  const maxChoiceChangeHandler = (value: string) => {
    onMaxChoiceAllowedChange(value);
    updateQuestionDetails((prev) => ({ ...prev, maxChoice: Number(value) }));
  };

  useEffect(() => {
    // const arr = [new ChoiceClass(0, "")];
    // setChoices([...arr]);
    if (questionType === "Multiple choice") {
      updateQuestionDetails((prev) => ({
        ...prev,
        maxChoice: 1,
        other: false,
      }));
    } else if (questionType === "Dropdown") {
      updateQuestionDetails((prev) => ({ ...prev, other: false }));
    }
    setEnableOtherOption(false);
  }, [questionType]);

  useEffect(() => {
    if (existingQuestionDetails) {
      existingQuestionDetails.maxChoice &&
        onMaxChoiceAllowedChange(existingQuestionDetails.maxChoice?.toString());
      setEnableOtherOption(existingQuestionDetails.other || false);
    }
  }, [existingQuestionDetails]);

  return (
    <>
      <div className={css.choice_container}>
        {choices.map((choice, i) => (
          <EachChoiceComponent
            index={i}
            choice={choice}
            key={i}
            choices={choices}
            setChoices={setChoices}
            questionType={questionType}
          />
        ))}
        <label>
          <Checkbox
            checked={enableOtherOption}
            onChange={(e) => toogleOtherOption(e.target.checked)}
            inputProps={{ "aria-label": "controlled" }}
            sx={{
              color: "#00635b",
              "&.Mui-checked": {
                color: "#00635b",
              },
            }}
          />{" "}
          <span>Enable "Other" option</span>
        </label>
        {questionType === "Multiple choice" && (
          <TextField
            variant="outlined"
            label="Max choice allowed"
            placeholder="Enter number of choice allowed here"
            type="number"
            className={css.input}
            value={maxChoiceAllowed}
            onChange={(e) => maxChoiceChangeHandler(e.target.value)}
            onBlur={onMaxChoiceAllowedBlur as any}
            // error={maxChoiceAllowedInputIsInvalid}
            // helperText={
            //   maxChoiceAllowedInputIsInvalid &&
            //   "Input must not be empty and must be a number"
            // }
          />
        )}
      </div>
    </>
  );
};

const VideoQuestiontypeComponent: FC<QuestionSubComponentPropsType> = () => {
  const availableDurationTypes = ["Seconds", "Minutes"];
  const [additionalQuestion, setAdditionalQuestion] = useState("");
  const {
    value: maxDuration,
    isValid: maxDurationIsValid,
    inputIsInValid: maxDurationInputIsInvalid,
    onChange: onMaxDurationChange,
    onBlur: onMaxDurationBlur,
  } = useInput<string>((value) =>
    value ? value.trim() !== "" && !Number.isNaN(value) : false
  );
  const {
    value: durationType,
    isValid: durationTypeIsValid,
    inputIsInValid: durationTypeInputIsInvalid,
    onChange: onDurationTypeChange,
    onBlur: onDurationTypeBlur,
  } = useInput<"Seconds" | "Minutes">({
    validateFunction: (value) =>
      value
        ? value.trim() !== "" && availableDurationTypes.includes(value)
        : false,
    defaultValue: "Seconds",
  });

  return (
    <>
      <div className={css.video_question}>
        <TextField
          variant="outlined"
          label="Additional information"
          placeholder="Please enter any additional information you want the applicant to see"
          className={css.input}
          value={additionalQuestion}
          onChange={(e) => setAdditionalQuestion(e.target.value)}
        />
        <div className={css.container}>
          <TextField
            variant="outlined"
            label="Max duration of video (in sec/min)"
            placeholder="Please enter the maximum duration of the video to be uploaded"
            className={css.input}
            value={maxDuration}
            onChange={(e) => onMaxDurationChange(e.target.value)}
            onBlur={onMaxDurationBlur as any}
            // error={maxDurationInputIsInvalid}
            // helperText={
            //   maxDurationInputIsInvalid && "Input must be a valid number"
            // }
          />
          <Autocomplete
            options={availableDurationTypes}
            value={durationType}
            className={css.input}
            onChange={(e, value) => onDurationTypeChange(value)}
            onBlur={onDurationTypeBlur as any}
            renderInput={(params) => (
              <TextField
                variant="outlined"
                label='Select "Seconds" or "Minutes"'
                placeholder="Please enter the format to measure the maximum duration of the video to be uploaded"
                // error={durationTypeInputIsInvalid}
                // helperText={
                //   durationTypeInputIsInvalid &&
                //   "Input must be a valid measure type"
                // }
                {...params}
              />
            )}
          />
        </div>
      </div>
    </>
  );
};

const YesNoQuestionTypeComponent: FC<
  QuestionSubComponentPropsType & {
    existingQuestionDetails?: AdditionalQuestionClass;
  }
> = ({ updateQuestionDetails, existingQuestionDetails }) => {
  const [disqualify, setDisqualify] = useState(false);

  const disqualifyChangeHandler = (state: boolean) => {
    setDisqualify(state);
    updateQuestionDetails((prev) => ({ ...prev, disqualify: state }));
  };

  useEffect(() => {
    if (existingQuestionDetails) {
      setDisqualify(existingQuestionDetails.disqualify || false);
    }
  }, []);

  return (
    <>
      <label>
        <Checkbox
          checked={disqualify}
          onChange={(e) => disqualifyChangeHandler(e.target.checked)}
          inputProps={{ "aria-label": "controlled" }}
          sx={{
            color: "#00635b",
            "&.Mui-checked": {
              color: "#00635b",
            },
          }}
        />{" "}
        <span>Disqualify candidate if the answer is no</span>
      </label>
    </>
  );
};

const QuestionComponent: FC<{
  action: Function;
  closeQUestionSection: Function;
}> = ({ action, closeQUestionSection }) => {
  const availableQuestionTypes: QuestionTypes[] = [
    "Date",
    "Dropdown",
    "File upload",
    "Multiple choice",
    "Number",
    "Paragraph",
    "Short answer",
    "Video question",
    "Yes/No",
  ];

  const [questionDetails, setQuestionDetails] =
    useState<AdditionalQuestionClass>(
      new AdditionalQuestionClass(
        uuidv4(),
        "Paragraph",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
    );
  const {
    value: questionType,
    isValid: questionTypeIsValid,
    inputIsInValid: questionTypeInputIsInvalid,
    onChange: onQuestionTypeChange,
    onBlur: onQuestionTypeBlur,
  } = useInput<QuestionTypes>({
    validateFunction: (value) =>
      value
        ? value.trim() !== "" && availableQuestionTypes.includes(value)
        : false,
    defaultValue: "Paragraph",
  });
  const {
    value: question,
    isValid: questionIsValid,
    inputIsInValid: questionInputIsInvalid,
    onChange: onQuestionChange,
    onBlur: onQuestionBlur,
    reset: resetQuestionInput,
  } = useInput<string>((value) => (value ? value.trim() !== "" : false));
  const { formIsValid, executeBlurHandlers, reset } = useForm({
    blurHandlers: [onQuestionBlur, onQuestionTypeBlur],
    validateOptions: () => questionIsValid && questionTypeIsValid,
    resetHandlers: [resetQuestionInput],
  });
  const [choices, setChoices] = useState<ChoiceClass[]>([]);
  const dispatch = useDispatch();

  const questionTypeChangeHandler: (
    event: React.SyntheticEvent<Element, Event>,
    value: QuestionTypes | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails | undefined
  ) => void = (e, value) => {
    onQuestionTypeChange(value || "Paragraph");
    resetQuestionInput();
    setQuestionDetails((prev) => ({
      ...prev,
      type: value || "Paragraph",
      choices: undefined,
      disqualify: undefined,
      maxChoice: undefined,
      other: undefined,
      question: undefined,
    }));

    if (value === "Multiple choice" || value === "Dropdown") {
      const arr = [new ChoiceClass(0, "")];
      setChoices([...arr]);
    } else {
      setChoices([]);
    }
  };
  const questionChangeHandler = (value: string) => {
    onQuestionChange(value);
    setQuestionDetails((prev) => ({ ...prev, question: value }));
  };

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    // ADD QUESTION
    const detailsToAdd = { ...questionDetails };
    detailsToAdd.choices = choices.map((choice) => choice.choice);
    console.log("DETAILS: ", detailsToAdd);
    dispatch(action(detailsToAdd) as any);
    closeQUestionSection();
  };

  const deleteHandler = () => {
    closeQUestionSection();
  };

  return (
    <>
      <Section title="Questions" className={css.question_component}>
        <Autocomplete
          options={availableQuestionTypes}
          value={questionType}
          onChange={questionTypeChangeHandler}
          onBlur={onQuestionTypeBlur as any}
          renderInput={(params) => (
            <TextField
              variant="outlined"
              label="Type"
              placeholder="Enter question type"
              error={questionTypeInputIsInvalid}
              helperText={
                questionTypeInputIsInvalid &&
                "Input must be a valid question type"
              }
              {...params}
            />
          )}
          className={css.auto_complete}
        ></Autocomplete>
        <TextField
          variant="outlined"
          label="Question"
          placeholder="Enter question"
          className={css.input}
          value={question}
          onChange={(e) => questionChangeHandler(e.target.value)}
          onBlur={onQuestionBlur as any}
          error={questionInputIsInvalid}
          helperText={questionInputIsInvalid && "Input must not be empty"}
        />
        {(questionType === "Multiple choice" ||
          questionType === "Dropdown") && (
          <ChoiceContainerComponent
            questionType={questionType}
            updateQuestionDetails={setQuestionDetails}
            choices={choices}
            setChoices={setChoices}
          />
        )}
        {questionType === "Video question" && (
          <VideoQuestiontypeComponent
            updateQuestionDetails={setQuestionDetails}
          />
        )}
        {questionType === "Yes/No" && (
          <YesNoQuestionTypeComponent
            updateQuestionDetails={setQuestionDetails}
          />
        )}
        <div className={css.actions}>
          <span className={css.delete_question} onClick={deleteHandler}>
            <i className="fas fa-xmark" />
            <span>Delete question</span>
          </span>
          <Button variant="contained" color="success" onClick={submitHandler}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
};

const DeleteQuestionConfirmationDialog: FC<{
  proceed: Function;
  closeModal: Function;
  displayModal: boolean;
}> = ({ proceed, closeModal, displayModal }) => {
  return (
    <>
      {createPortal(
        <Dialog
          open={displayModal}
          onClose={closeModal as any}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to delete this question? This action cannot be
            undone!
          </DialogTitle>

          <DialogActions>
            <Button onClick={closeModal as any}>Cancel</Button>
            <Button onClick={proceed as any}>Delete</Button>
          </DialogActions>
        </Dialog>,
        document.getElementById("modal") as Element
      )}
    </>
  );
};

const EditQuestionComponent: FC<{
  editAction: Function;
  deleteAction: Function;
  closeQUestionSection: Function;
  existingQuestionDetails: AdditionalQuestionClass;
}> = ({
  editAction,
  deleteAction,
  closeQUestionSection,
  existingQuestionDetails,
}) => {
  const [displayDeleteConfirmationModal, setDisplayDeleteConfirmationModal] =
    useState(false);
  const [questionDetails, setQuestionDetails] =
    useState<AdditionalQuestionClass>(
      new AdditionalQuestionClass(
        uuidv4(),
        "Paragraph",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
    );
  const {
    value: question,
    isValid: questionIsValid,
    inputIsInValid: questionInputIsInvalid,
    onChange: onQuestionChange,
    onBlur: onQuestionBlur,
    reset: resetQuestionInput,
  } = useInput<string>((value) => (value ? value.trim() !== "" : false));
  const { formIsValid, executeBlurHandlers } = useForm({
    blurHandlers: [onQuestionBlur],
    validateOptions: () => questionIsValid,
    resetHandlers: [resetQuestionInput],
  });
  const [choices, setChoices] = useState<ChoiceClass[]>([]);
  const dispatch = useDispatch();

  const questionChangeHandler = (value: string) => {
    onQuestionChange(value);
    setQuestionDetails((prev) => ({ ...prev, question: value }));
  };

  const submitHandler = () => {
    if (!formIsValid) return executeBlurHandlers();

    // ADD QUESTION
    const detailsToUpdate = { ...questionDetails };
    detailsToUpdate.choices = choices.map((choice) => choice.choice);
    console.log("DETAILS: ", detailsToUpdate);
    dispatch(editAction(detailsToUpdate) as any);
    closeQUestionSection();
  };

  const deleteHandler = () => {
    // ADD QUESTION
    dispatch(deleteAction(questionDetails) as any);
    closeQUestionSection();
  };

  const closeSection = () => {
    closeQUestionSection();
  };

  useEffect(() => {
    setQuestionDetails(existingQuestionDetails);
    onQuestionChange(existingQuestionDetails.question);
    existingQuestionDetails.choices &&
      setChoices(
        existingQuestionDetails.choices?.map(
          (choice, i) => new ChoiceClass(i, choice)
        )
      );
  }, []);

  return (
    <>
      <div className={css.edit_question_component}>
        <TextField
          variant="outlined"
          label="Question"
          placeholder="Enter question"
          className={css.input}
          value={question}
          onChange={(e) => questionChangeHandler(e.target.value)}
          onBlur={onQuestionBlur as any}
          error={questionInputIsInvalid}
          helperText={questionInputIsInvalid && "Input must not be empty"}
        />
        {(existingQuestionDetails.type === "Multiple choice" ||
          existingQuestionDetails.type === "Dropdown") && (
          <ChoiceContainerComponent
            questionType={existingQuestionDetails.type}
            updateQuestionDetails={setQuestionDetails}
            choices={choices}
            existingQuestionDetails={existingQuestionDetails}
            setChoices={setChoices}
          />
        )}
        {existingQuestionDetails.type === "Video question" && (
          <VideoQuestiontypeComponent
            updateQuestionDetails={setQuestionDetails}
          />
        )}
        {existingQuestionDetails.type === "Yes/No" && (
          <YesNoQuestionTypeComponent
            updateQuestionDetails={setQuestionDetails}
            existingQuestionDetails={existingQuestionDetails}
          />
        )}
        <div className={css.actions}>
          <div className={css.left}>
            <span
              className={css.delete_question}
              onClick={() => setDisplayDeleteConfirmationModal(true)}
            >
              <i className="fas fa-xmark" />
              <span>Delete question</span>
            </span>
            <Button variant="contained" color="warning" onClick={closeSection}>
              Close
            </Button>
          </div>

          <Button variant="contained" color="success" onClick={submitHandler}>
            Save
          </Button>
        </div>
      </div>
      {displayDeleteConfirmationModal && (
        <DeleteQuestionConfirmationDialog
          closeModal={() => setDisplayDeleteConfirmationModal(false)}
          displayModal={displayDeleteConfirmationModal}
          proceed={deleteHandler}
        />
      )}
    </>
  );
};

const Dashboard: FC = () => {
  const attributes: AttributesReducerType = useSelector<SelectorType>(
    (state) => state.attribute
  ) as AttributesReducerType;
  const dispatch = useDispatch();

  const updateDetails = () => {
    dispatch(updateDetaisAction({ ...attributes }) as unknown as any);
  };

  useEffect(() => {
    dispatch(fetchDetaisAction() as unknown as AnyAction);
  }, []);

  if (
    attributes.metadata.fetching === true ||
    attributes.metadata.fetching === undefined
  ) {
    return <>Loading...</>;
  }

  return (
    <>
      <section className={css.dashboard}>
        <UploadCoverImageSection existingImage={attributes.coverImage} />
        <PersonalInformationSection
          personalInformationFields={attributes.personalInformation}
        />
        <ProfileInformationSection
          profileInformationFields={attributes.profile}
        />
        <AdditionalQuestionsSection
          additionalQuestions={attributes.customisedQuestions}
        />
        <div className={css.actions}>
          <Button
            variant="contained"
            color="success"
            onClick={updateDetails}
            disabled={attributes.metadata.editing}
          >
            {attributes.metadata.editing ? "Saving" : "Save details"}
          </Button>
        </div>
      </section>
      {attributes.metadata.errorFetching && (
        <>
          <Snackbar
            open={attributes.metadata.errorFetching}
            autoHideDuration={6000}
            onClose={() =>
              dispatch(attributeActions.toogleErrorFetching(false))
            }
          >
            <Alert
              severity="error"
              onClose={() =>
                dispatch(attributeActions.toogleErrorFetching(false))
              }
            >
              We encountered an error while fetching the details from the
              endpoint. The dummy details is being used instead!
            </Alert>
          </Snackbar>
        </>
      )}
    </>
  );
};

export default Dashboard;
