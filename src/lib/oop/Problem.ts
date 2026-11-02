import { ProblemType } from './types';

/**
 * Abstract Base Class: Problem
 * Represents a mathematical problem in the system.
 * Follows OOP Abstraction and Encapsulation principles.
 */
export abstract class Problem {
  protected id: string;
  protected userId: string;
  protected problemType: ProblemType;
  protected rawInput: string;
  protected createdAt: Date;

  constructor(rawInput: string, problemType: ProblemType, userId: string = 'guest') {
    this.id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.userId = userId;
    this.problemType = problemType;
    this.rawInput = rawInput;
    this.createdAt = new Date();
  }

  // Encapsulation: Getter methods
  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getProblemType(): ProblemType {
    return this.problemType;
  }

  public getInput(): string {
    return this.rawInput;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Abstract method: Validate and parse input into structured format
   */
  public abstract formatInput(): boolean;
}
