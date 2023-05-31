import { v4 as uuidV4 } from "uuid";
import { Database, child, get, getDatabase, onValue, push, ref, set } from "firebase/database";
import { User } from "firebase/auth";


 export class Task {
    createdAt: Date
    completed: boolean;    
    id: string;
    title: string;

    constructor(myId : string, myTitle: string, myCompleted: boolean, myDate: Date){
      this.id = myId;
      this.title = myTitle;
      this.completed = myCompleted;
      this.createdAt = myDate;
    }
  }

  export function createTask(input: HTMLInputElement) : Task {
    const newTask = new Task(uuidV4(), input.value, false, new Date());
    return newTask;
  }
  
  export function addListItem(task: Task, db: Database, userID: string, tasks: any[]) : HTMLElement {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.addEventListener("change", () => {
      task.completed = check.checked;
      saveTasks(db, userID, tasks);
    });
    check.checked = task.completed;
    label.append(check, task.title);
    item.append(label);
    return item;
  };

  
  export function saveTasks(db: Database, userID: string, tasks: any[]){
    set(ref(db, 'users/' + userID + '/savedTasks'), {
      savedTasks: tasks,
    });
    // localStorage.setItem("TASKS", JSON.stringify(tasks));
  }
  
  export function loadTasks(db: Database, userID: string, tasks: any[]){
    let data : Task[];
    get(child(ref(db), 'users/' + userID + '/savedTasks')).then((snapshot) => {
      if(snapshot.exists()) {
        Object.values(snapshot.val()).forEach((e) => {tasks.push(e)});
        console.log(tasks);
      }
    });
  }