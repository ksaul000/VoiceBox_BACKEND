import { getRequest } from "../mssql";

export async function validateUserInput(input: any): Promise<string[]> {
    //const b = await getRequest().query(`SELECT * FROM USERS WITH email=${input.email}`)
  const errors: string[] = [];

  if (!input.nickname || input.nickname.trim().length < 5) {
    errors.push('Nickname must have at least 5 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!input.email || input.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!emailRegex.test(input.email)) {
    errors.push('Invalid email format');
  }

  const passwordRegex = /^(?=.*\d).{8,}$/;

  if (!input.password || input.password.trim().length === 0) {
    errors.push('Password is required');
  } else if (!passwordRegex.test(input.password)) {
    errors.push('Password must be at least 8 characters long and contain at least one number');
  }

  if (!input.reentered_password || input.reentered_password.trim().length === 0) {
    errors.push('Re-entered password is required');
  }

  if (input.password !== input.reentered_password) {
    errors.push('Re-entered and password do not match');
  }

  try {
    const usersWithIdenticNickname = await getRequest().query(`SELECT * FROM USERS WHERE nickname='${input.nickname}'`)
    if (usersWithIdenticNickname.recordset.length > 0) {
      errors.push('A user with this nickname already exists');
    }
  } catch (error) {
    errors.push('Error checking for users with identical nickname');
    console.error(error);
  }

  try {
    const usersWithIdenticNickname = await getRequest().query(`SELECT * FROM USERS WHERE email='${input.email}'`)
    if (usersWithIdenticNickname.recordset.length > 0) {
      errors.push('A user with this email already exists');
    }
  } catch (error) {
    errors.push('Error checking for users with identical email');
    console.error(error);
  }

  return errors;
};


export async function validateHotTakesInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!input.Content || input.Content.trim() === "") {
    errors.push("Content cannot be empty.");
  }

  const topicRegex = /^[#]?[a-zA-Z]+$/;
  if (!input.Topic || !topicRegex.test(input.Topic)) {
    errors.push("Topic must be a word consisting of only alphabetic letters and may start with a '#' character.");
  }

  try {
    const userQueryResult = await getRequest().query(`SELECT * FROM USERS WHERE id=${input.UserId}`)
    if (userQueryResult.recordset.length === 0) {
      errors.push("Authentification Error1");
    }
  } catch (error) {
    errors.push('Authentification Error!');
    console.error(error);
  }

  return errors;
}

export async function validateQuestInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  const topicRegex = /^[#]?[a-zA-Z]+$/;
  if (!input.Topic || !topicRegex.test(input.Topic)) {
    errors.push("Topic must be a word consisting of only alphabetic letters and may start with a '#' character.");
  }

  try {
    const userQueryResult = await getRequest().query(`SELECT * FROM USERS WHERE id=${input.UserID}`)
    if (userQueryResult.recordset.length === 0) {
      errors.push("Authentification Error1");
    }
  } catch (error) {
    errors.push('Authentification Error!');
    console.error(error);
  }

  try {
    const userQueryResult = await getRequest().query(`SELECT * FROM Quests WHERE topic='${input.Topic}'`)
    if (userQueryResult.recordset.length > 0) {
      errors.push(`A quest with ${input.Topic} already exists!`);
    }
  } catch (error) {
    errors.push(`A quest with ${input.Topic} already exists!`);
    console.error(error);
  }

  return errors;
}


export async function validateReactInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  if (!Number.isInteger(input.HotTakeId)) {
    errors.push("HotTakeId must be an integer.");
  }

  const allowedReactTypes = ['Opinion Is Unclear', 'AGREE', 'DISAGREE'];
  if (!allowedReactTypes.includes(input.ReactType)) {
    errors.push(`ReactType must be one of the following values: ${allowedReactTypes.join(", ")}.`);
  }

  try {
    const userQueryResult = await getRequest().query(`SELECT * FROM USERS WHERE id=${input.UserId}`)
    if (userQueryResult.recordset.length === 0) {
      errors.push("Authentication error: User does not exist.");
    }
  } catch (error) {
    errors.push('Authentication error: Failed to query the database.');
    console.error(error);
  }

  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM hot_takes WHERE id=${input.HotTakeId}`)
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Hot take does not exist.");
    }
  } catch (error) {
    errors.push('Error: Failed to query the database.');
    console.error(error);
  }

  return errors;
}


export async function validateDeleteHotTakeInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  if (!Number.isInteger(input.HotTakeId)) {
    errors.push("HotTakeId must be an integer.");
  }
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM hot_takes WHERE id=${input.HotTakeId} AND user_id=${input.UserId}` );
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Unauthorized Action");
    }
  } catch (error) {
    errors.push('Error: Unauthorized Action.');
    console.error(error);
  }

  return errors;
}


export async function validateDeleteQuestInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  if (!Number.isInteger(input.QuestId)) {
    errors.push("QuestId must be an integer.");
  }
  try {
    const hotQuestsResult = await getRequest().query(`SELECT * FROM quests WHERE id=${input.QuestId} AND user_id=${input.UserId}` );
    if (hotQuestsResult.recordset.length === 0) {
      errors.push("Unauthorized Action");
    }
  } catch (error) {
    errors.push('Error: Unauthorized Action.');
    console.error(error);
  }

  return errors;
}


export async function validateCompleteQuestInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  const topicRegex = /^[#]?[a-zA-Z]+$/;
  if (!input.Topic || !topicRegex.test(input.Topic)) {
    errors.push("Topic must be a word consisting of only alphabetic letters and may start with a '#' character.");
  }
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM quests WHERE topic='${input.Topic}';`);
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Topic does not exist!");
    }
  } catch (error) {
    errors.push('Error: Topic does not exist!.');
    console.error(error);
  }
  
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM users WHERE id=${input.UserId};` );
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Unauthorized Action");
    }
  } catch (error) {
    errors.push('Error: Unauthorized Action.');
    console.error(error);
  }

  return errors;
}


export async function validateGetQuestsInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  const topicRegex = /^[#]?[a-zA-Z]+$/;
  if (!input.Topic || !topicRegex.test(input.Topic)) {
    errors.push("Topic must be a word consisting of only alphabetic letters and may start with a '#' character.");
  }
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM quests WHERE topic='${input.Topic}';`);
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Topic does not exist!");
    }
  } catch (error) {
    errors.push('Error: Topic does not exist!.');
    console.error(error);
  }
  
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM users WHERE id=${input.UserId};` );
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Unauthorized Action");
    }
  } catch (error) {
    errors.push('Error: Unauthorized Action.');
    console.error(error);
  }

  return errors;
}


export async function validateFinishQuestInput(input: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(input.UserId)) {
    errors.push("UserId must be an integer.");
  }

  if (!Number.isInteger(input.QuestId)) {
    errors.push("QuestId must be an integer.");
  }
  try {
    const hotQuestsResult = await getRequest().query(`SELECT * FROM quests WHERE id=${input.QuestId}` );
    if (hotQuestsResult.recordset.length === 0) {
      errors.push("Quest Does not exist");
    }
  } catch (error) {
    errors.push('Error: Quest Does not exist.');
    console.error(error);
  }
  
  try {
    const hotTakeQueryResult = await getRequest().query(`SELECT * FROM users WHERE id=${input.UserId};` );
    if (hotTakeQueryResult.recordset.length === 0) {
      errors.push("Unauthorized Action");
    }
  } catch (error) {
    errors.push('Error: Unauthorized Action.');
    console.error(error);
  }

  return errors;
}

export async function validateHaveBadgeInput(id: any): Promise<string[]> {
  const errors: string[] = [];

  if (!Number.isInteger(id)) {
    errors.push("UserId must be an integer.");
  }
  try {
    const usersQueryResult = await getRequest().query(`SELECT * FROM users WHERE id=${id};` );
    if (usersQueryResult.recordset.length === 0) {
      errors.push("Inexistent User");
    }
  } catch (error) {
    errors.push('Error: Inexistent User.');
    console.error(error);
  }

  return errors;
}