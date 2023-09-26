import axios from "axios";
import { AttributesReducerType } from "../types";
import {
  AdditionalQuestionClass,
  PersonalInfoClass,
  PersonalInfoFieldClass,
  ProfileClass,
  ProfileInfoFieldClass,
} from "../utils/utils";
import { createSlice, Dispatch, AnyAction } from "@reduxjs/toolkit";
import { attributeActions } from "./store";

const personalInformationFields: Record<string, PersonalInfoClass> = {
  ...new PersonalInfoFieldClass("First Name", false, false),
  ...new PersonalInfoFieldClass("Last Name", false, false),
  ...new PersonalInfoFieldClass("Email", false, false),
  ...new PersonalInfoFieldClass("Phone (without dial code)", false, false),
  ...new PersonalInfoFieldClass("Nationality", false, false),
  ...new PersonalInfoFieldClass("Current Residence ", false, false),
  ...new PersonalInfoFieldClass("ID Number", false, false),
  ...new PersonalInfoFieldClass("Date of Birth ", false, false),
  ...new PersonalInfoFieldClass("Gender", false, false),
};

const profileInformationFields: Record<string, ProfileClass> = {
  ...new ProfileInfoFieldClass("Education", false, false),
  ...new ProfileInfoFieldClass("Experience", true, true),
  ...new ProfileInfoFieldClass("Resume", false, false),
};

const additionalQuestions: AdditionalQuestionClass[] = [
  new AdditionalQuestionClass(
    "1",
    "Paragraph",
    "Please tell me about yourself in less than 500 words"
  ),
  new AdditionalQuestionClass(
    "2",
    "Dropdown",
    "Please select the year of graduation from the list below",
    ["1st", "2nd"]
  ),
  new AdditionalQuestionClass(
    "3",
    "Yes/No",
    "Have you ever been rejected by the UK embassy?"
  ),
];

const initialState: AttributesReducerType = {
  coverImage: "",
  personalInformation: {
    ...personalInformationFields,
    personalQuestions: [],
  } as any,
  profile: { ...profileInformationFields, profileQuestions: [] } as any,
  customisedQuestions: [...additionalQuestions],
  metadata: {
    fetching: undefined,
    editing: undefined,
    errorEditing: undefined,
    errorFetching: undefined,
  },
};

const attributesSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {
    uploadCoverImage: (state, action: { payload: string }) => {
      state.coverImage = action.payload;
      console.log("IMAGE", state.coverImage);
    },
    editPersonalInformation: (
      state,
      {
        payload,
      }: {
        payload: {
          key: string;
          options: { internalUse?: boolean; show?: boolean };
        };
      }
    ) => {
      state.personalInformation[payload.key] = {
        ...state.personalInformation[payload.key],
        ...payload.options,
      };
    },
    addPersonalQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      state.personalInformation.personalQuestions.push(payload);
      console.log([...state.personalInformation.personalQuestions]);
    },
    editPersonalQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const index = state.personalInformation.personalQuestions.findIndex(
        (question) => question.id === payload.id
      );
      if (index === -1) return;
      state.personalInformation.personalQuestions[index] = {
        ...state.personalInformation.personalQuestions[index],
        ...payload,
      };
    },
    deletePersonalQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const filteredQuestions =
        state.personalInformation.personalQuestions.filter(
          (question) => question.id !== payload.id
        );
      state.personalInformation.personalQuestions = [...filteredQuestions];
    },
    editProfile: (
      state,
      {
        payload,
      }: {
        payload: {
          key: string;
          options: { mandatory?: boolean; show?: boolean };
        };
      }
    ) => {
      state.profile[payload.key] = {
        ...state.profile[payload.key],
        ...payload.options,
      };
    },
    addProfileQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      state.profile.profileQuestions.push(payload);
      console.log([...state.profile.profileQuestions]);
    },
    editProfileQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const index = state.profile.profileQuestions.findIndex(
        (question) => question.id === payload.id
      );
      if (index === -1) return;
      state.profile.profileQuestions[index] = {
        ...state.profile.profileQuestions[index],
        ...payload,
      };
    },
    deleteProfileQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const filteredQuestions = state.profile.profileQuestions.filter(
        (question) => question.id !== payload.id
      );
      state.profile.profileQuestions = [...filteredQuestions];
    },
    addCustomizedQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      state.customisedQuestions.push(payload);
      console.log([...state.customisedQuestions]);
    },
    editCustomizedQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const index = state.customisedQuestions.findIndex(
        (question) => question.id === payload.id
      );
      if (index === -1) return;
      state.customisedQuestions[index] = {
        ...state.customisedQuestions[index],
        ...payload,
      };
    },
    deleteCustomizedQuestion: (
      state,
      { payload }: { payload: AdditionalQuestionClass }
    ) => {
      const filteredQuestions = state.customisedQuestions.filter(
        (question) => question.id !== payload.id
      );
      state.customisedQuestions = [...filteredQuestions];
    },
    addDetails: (state, { payload }: { payload: AttributesReducerType }) => {
      state.coverImage = payload.coverImage;
      state.personalInformation = payload.personalInformation;
      state.profile = payload.profile;
      state.customisedQuestions = payload.customisedQuestions;
    },
    toogleFetching: (state, { payload }: { payload: boolean }) => {
      state.metadata.fetching = payload;
    },
    toogleEditing: (state, { payload }: { payload: boolean }) => {
      state.metadata.editing = payload;
    },
    toogleErrorFetching: (state, { payload }: { payload: boolean }) => {
      state.metadata.errorFetching = payload;
    },
    toogleErrorEditing: (state, { payload }: { payload: boolean }) => {
      state.metadata.errorEditing = payload;
    },
  },
});

export const fetchDetaisAction = () => {
  const fetchDetails = async (dispatch: Dispatch<AnyAction>) => {
    try {
      dispatch(attributeActions.toogleErrorFetching(false));
      dispatch(attributeActions.toogleFetching(true));
      const response = await axios.get<{
        data: { attributes: AttributesReducerType };
      }>(
        process.env.API_GET_ENDPOINT ||
          "http://localhost:4010/api/v1/programs/prince-project/application-form"
      );

      if (response) {
        dispatch(attributeActions.addDetails(response.data.data.attributes));
        dispatch(attributeActions.toogleFetching(false));
        dispatch(attributeActions.toogleErrorFetching(false));
      }
    } catch (error) {
      dispatch(attributeActions.toogleFetching(false));
      dispatch(attributeActions.toogleErrorFetching(true));
    }
  };
  return async (dispatch: Dispatch<AnyAction>) => {
    await fetchDetails(dispatch);
  };
};

export const updateDetaisAction = (details: AttributesReducerType) => {
  const updateDetails = async (dispatch: Dispatch<AnyAction>) => {
    dispatch(attributeActions.toogleErrorEditing(false));
    dispatch(attributeActions.toogleEditing(true));
    const response = await axios
      .put<AttributesReducerType>(
        process.env.API_PUT_ENDPOINT ||
          "http://localhost:4010/api/v1/programs/prince-project/application-form",
        {
          data: {
            id: "497f6eca-6276-4993-bfeb-53cbbbba6f08",
            type: "applicationForm",
            attributes: details,
          },
        }
      )
      .catch((e) => {
        dispatch(attributeActions.toogleEditing(false));
        dispatch(attributeActions.toogleErrorEditing(true));
      });

    if (response) {
      dispatch(attributeActions.toogleEditing(false));
      dispatch(attributeActions.toogleErrorEditing(false));
    }
  };
  return async (dispatch: Dispatch<AnyAction>) => {
    await updateDetails(dispatch);
  };
};

export default attributesSlice;
