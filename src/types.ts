import {
  AdditionalQuestionClass,
  PersonalInfoFieldClass,
  ProfileInfoFieldClass,
} from "./utils/utils";

export type QuestionTypes =
  | "Paragraph"
  | "Short answer"
  | "Yes/No"
  | "Dropdown"
  | "Multiple choice"
  | "Date"
  | "Number"
  | "File upload"
  | "Video question";
export type QuestionSubComponentPropsType = {
  updateQuestionDetails: React.Dispatch<
    React.SetStateAction<AdditionalQuestionClass>
  >;
};
export type PersonalInformationType = {
  personalQuestions: AdditionalQuestionClass[];
} & Record<
  string,
  {
    internalUse: boolean;
    show: boolean;
  }
>;
export type ProfileType = {
  profileQuestions: AdditionalQuestionClass[];
} & Record<
  string,
  {
    mandatory: boolean;
    show: boolean;
  }
>;
export type AttributesReducerType = {
  coverImage: string;
  personalInformation: PersonalInformationType;
  profile: ProfileType;
  customisedQuestions: AdditionalQuestionClass[];
} & {
  metadata: {
    fetching: boolean | undefined;
    editing: boolean | undefined;
    errorFetching: boolean | undefined;
    errorEditing: boolean | undefined;
  };
};

export type SelectorType = {
  attribute: AttributesReducerType;
};
