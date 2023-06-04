import { v4 as uuidV4 } from "uuid";
import { Database, child, get, ref, update } from "firebase/database";


 export class Task {
    createdAt: string
    completed: boolean;    
    id: string;
    title: string;
    description: string;
    public: boolean;

    constructor(myId : string, myTitle: string,  myCompleted: boolean, myDate: string){
      this.id = myId;
      this.title = myTitle;
      this.completed = myCompleted;
      this.createdAt = myDate;
      this.description = "placeholder";
      this.public = true;
    }
  }

  export function createTask(input: HTMLInputElement) : Task {
    const newTask = new Task(uuidV4(), input.value, false, JSON.stringify(new Date()));
    return newTask;
  }
  
  export function addListItem(obj: object, db: Database, userID: string) : HTMLElement {
    const task = obj as Task;
    const item = document.createElement("li");
    const label = document.createElement("label");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.addEventListener("change", () => {
      task.completed = check.checked;
      saveTasks(db, userID, task);
    });
    check.checked = task.completed;
    label.append(check, task.title);
    item.append(label);
    return item;
  };

  
  export function saveTasks(db: Database, userID: string, taskUpd: Task){
    let taskToUp: string | null;
    get(ref(db, 'users/' + userID + '/tasks/')).then(data => data.forEach(e => {if(e.val().id == taskUpd.id) taskToUp = e.key}));
    setTimeout(() => update(ref(db, 'users/' + userID + '/tasks/' + taskToUp), taskUpd), 5);
  };
  
  export function loadTasks(db: Database, userID: string, tasks: any[]){
    get(child(ref(db), 'users/' + userID + '/tasks')).then((snapshot) => {
      if(snapshot.exists()) {
        Object.values(snapshot.val()).forEach((e) => {
          tasks.push(e)
        });
      }
    });
  }