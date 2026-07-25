import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const name = sessionStorage.getItem('name');

    const getTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks/`, {
                method: "GET",
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) setTasks(data.tasks);
            else alert(data.message || "Erro ao obter tasks!");
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                sessionStorage.removeItem('name');
                navigate('/');
            }
            else alert(data.message || "Erro ao deslogar!");
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleAddTask = async (input) => {
        if (!input.trim()) return;

        try {
            const response = await fetch(`${API_URL}/tasks/`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ description: input })
            });
            const data = await response.json();

            if (response.ok) {
                setTasks([...tasks, data.task]);
                setInput('');
            } else alert(data.message || "Erro ao adicionar tarefa!");
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleUpdateTask = async (taskId, newDescription, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ description: newDescription, status: newStatus })
            });
            const data = await response.json();

            if (response.ok) setTasks(tasks.map(t => t._id === taskId ? data.updatedTask : t));
            else alert(data.message || "Erro ao atualizar tarefa!");
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "DELETE",
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) setTasks(tasks.filter(task => task._id !== taskId));
            else alert(data.message || "Erro ao deletar tarefa!");
        } catch (error) {
            alert("Erro de conexão com o servidor.");
        }
    };

    return (
        <main className={styles['card-container']}>
            <header className={styles['header']}>
                <a href="#" className={styles['logout-link']} onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sair</a>
                <h1 className={styles['title']}>SUAS TAREFAS</h1>
                <p className={styles['subtitle']}>
                    {name ? `OLÁ ${name.toUpperCase()}!` : 'CARREGANDO...'}
                </p>
            </header>

            <ul className={styles['task-list']}>
                {tasks.map((task) => (
                    <li className={styles['task-item']} key={task._id}>
                        <button
                            className={`${styles['status-btn']} ${task.status === 'Completed' ? styles.success : task.status === 'Pending' ? styles.pending : styles.warning}`}
                            title={task.status === 'Completed' ? 'Concluída' : task.status === 'Pending' ? 'Não iniciada' : 'Em andamento'}
                            onClick={() => handleUpdateTask(task._id, task.description, task.status === 'Pending' ? 'In Progress' : task.status === 'In Progress' ? 'Completed' : 'In Progress')}
                        >
                            <i className={task.status === 'Completed' ? 'fa-solid fa-circle-check' : task.status === 'Pending' ? 'fa-regular fa-circle' : 'fa-solid fa-circle-half-stroke'}></i>
                        </button>

                        {editingTaskId === task._id ? (
                            <input
                                type="text"
                                className={styles['edit-task-input']}
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onBlur={() => setEditingTaskId(null)}
                                onKeyDown={(e) => { 
                                    if (e.key === "Enter") {
                                        if (editingText.trim() !== "" && editingText !== task.description) handleUpdateTask(task._id, editingText, task.status);
                                        setEditingTaskId(null);
                                    }
                                    if (e.key === "Escape") setEditingTaskId(null);
                                }}
                                autoFocus
                            />
                        ) : (
                            <span className={`${styles['task-text']} ${task.status === 'Completed' ? styles['completed-text'] : ''}`}>
                                {task.description}
                            </span>
                        )}

                        <div className={styles['action-buttons']}>
                            <button className={styles['action-btn']}
                                onClick={() => { setEditingTaskId(task._id); setEditingText(task.description); }}>
                                <i className="fa-solid fa-pen"></i>
                            </button>

                            <button className={`${styles['action-btn']} ${styles['delete']}`}
                                onClick={() => handleDeleteTask(task._id)}>
                                <i className="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <section className={styles['add-task-section']}>
                <label htmlFor="new-task-input" className={styles['add-task-label']}>ADICIONAR NOVA TAREFA</label>
                <input
                    id="new-task-input"
                    type="text"
                    value={input}
                    className={styles['add-task-input']}
                    placeholder="Digite o que você precisa fazer..."
                    minLength={5}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(input); }}
                    autoFocus
                />
                <button className={styles['add-btn']} onClick={() => { handleAddTask(input); }}>
                    ADICIONAR
                </button>
            </section>
        </main>
    );
}

export default Dashboard;