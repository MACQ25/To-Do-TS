import { v4 as uuidV4 } from "uuid";
import { Database, child, get, getDatabase, onValue, ref, set } from "firebase/database";
import { User } from "firebase/auth";


 export type Task = {
    id: string,
    title: string,
    completed: boolean,
    createdAt: Date,
  }

  export function createTL(input: HTMLInputElement, tasks: Task[]) : Task | null{
    if(input?.value == "" || input?.value == null) return null;
    const newTask = {
      id: uuidV4(),
      title:input.value,
      completed: false,
      createdAt: new Date(),
    }
    tasks.push(newTask);
    input.value = "";
    return newTask;
  }
  
  export function addListItem(task: Task, db: Database, userID: string, tasks: Task[], listRef: HTMLUListElement) {
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
    listRef.append(item);
  };
  
  export function saveTasks(db: Database, userID: string, tasks: Task[]){
    set(ref(db, 'users/' + userID + '/savedTasks'), {
      savedTasks: tasks,
    });
    // localStorage.setItem("TASKS", JSON.stringify(tasks));
  }
  
  export function loadTasks(db: Database, userID: string, tasks: Task[]){
    let data : Task[];
    get(child(ref(db), 'users/' + userID + '/savedTasks')).then((snapshot) => {
      if(snapshot.exists()) {
        data = snapshot.val().savedTasks;
        data.forEach(e => {
          tasks.push(e);
        });
      }
    });
  }