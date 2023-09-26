import { QuestionTypes } from "../types";

export class PersonalInfoFieldClass {
  constructor(name: string, internalUse: boolean, show: boolean) {
    (this as any)[name] = {
      internalUse: internalUse,
      show: show,
    };
  }
}

export class PersonalInfoClass {
  constructor(public internalUse: boolean, public show: boolean) {
    this.internalUse = internalUse;
    this.show = show;
  }
}

export class ChoiceClass {
  constructor(public id: string | number, public choice: string) {}
}

export class ProfileInfoFieldClass {
  constructor(name: string, mandatory: boolean, show: boolean) {
    (this as any)[name] = {
      mandatory: mandatory,
      show: show,
    };
  }
}

export class ProfileClass {
  constructor(public mandatory: boolean, public show: boolean) {
    this.mandatory = mandatory;
    this.show = show;
  }
}

export class AdditionalQuestionClass {
  constructor(
    public id: string,
    public type: QuestionTypes | undefined,
    public question: string | undefined,
    public choices?: string[] | undefined,
    public maxChoice?: number | undefined,
    public disqualify?: boolean | undefined,
    public other?: boolean | undefined
  ) {}
}
