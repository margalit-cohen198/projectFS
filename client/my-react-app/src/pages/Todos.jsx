import React, { useState, useEffect } from 'react';

function Todos() {
    const [todos, setTodos] = useState([]);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [editedTodoTitle, setEditedTodoTitle] = useState('');
    const [sortCriteria, setSortCriteria] = useState('id');
    const [searchCriteria, setSearchCriteria] = useState('title');
    const [searchValue, setSearchValue] = useState('');
    const [filteredTodos, setFilteredTodos] = useState([]);

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        applyFiltersAndSorting(todos);
    }, [todos, sortCriteria, searchCriteria, searchValue]);

    const fetchTodos = async () => {
        if (!currentUser?.id) return;
        try {
            const response = await fetch(`http://localhost:3001/todos?userId=${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                setTodos(data.sort((a, b) => a.id - b.id));
            } else {
                console.error('Failed to fetch todos');
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const handleAddTodo = async () => {
        if (!newTodoTitle.trim() || !currentUser?.id) return;
        try {
            const response = await fetch(`http://localhost:3001/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // חשוב: userId חייב להיות כאן ב-body, כפי שהשרת מצפה ב-todos.js
                body: JSON.stringify({ userId: currentUser.id, title: newTodoTitle }),
            });
            if (response.ok) {
                setNewTodoTitle('');
                fetchTodos(); // רענן את רשימת המטלות לאחר ההוספה
            } else {
                console.error('Failed to add todo');
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const handleToggleComplete = async (id, completed) => {
        if (!currentUser?.id) return; // ודא ש-currentUser.id קיים
        try {
            const response = await fetch(`http://localhost:3001/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, completed: !completed }),
            });
            if (response.ok) {
                setTodos(prevTodos =>
                    prevTodos.map(todo =>
                        todo.id === id ? { ...todo, completed: !completed } : todo
                    )
                );
            } else {
                console.error('Failed to update todo');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handleDeleteTodo = async (id) => {
        if (!currentUser?.id) return; 
        try {
            const response = await fetch(`http://localhost:3001/todos/${id}?userId=${currentUser.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
            } else {
                console.error('Failed to delete todo');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };
    const handleEditTodo = (todo) => {
        setEditingTodoId(todo.id);
        setEditedTodoTitle(todo.title);
    };

    const handleSaveEditTodo = async (id) => {
        if (!editedTodoTitle.trim() || !currentUser?.id) return; 
        try {
            const response = await fetch(`http://localhost:3001/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, title: editedTodoTitle }),
            });
            if (response.ok) {
                setEditingTodoId(null);
                setTodos(prevTodos =>
                    prevTodos.map(todo =>
                        todo.id === id ? { ...todo, title: editedTodoTitle } : todo
                    )
                );
            } else {
                console.error('Failed to update todo');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };
    const applyFiltersAndSorting = (currentTodos) => {
        let filtered = [...currentTodos];

        // סינון
        if (searchValue) {
            filtered = filtered.filter(todo => {
                const valueToSearch = String(todo[searchCriteria]).toLowerCase();
                return valueToSearch.includes(searchValue.toLowerCase());
            });
        }

        // מיון
        filtered.sort((a, b) => {
            if (sortCriteria === 'id') {
                return a.id - b.id;
            } else if (sortCriteria === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortCriteria === 'completed') {
                return (a.completed === b.completed) ? 0 : (a.completed ? -1 : 1);
            }
            return 0;
        });

        setFilteredTodos(filtered);
    };

    const handleSortChange = (e) => {
        setSortCriteria(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchCriteriaChange = (e) => {
        setSearchCriteria(e.target.value);
        setSearchValue(''); // איפוס שדה החיפוש כשמשנים קריטריון
    };

    return (
        <div>
            <h2>Your Todos</h2>
            <div>
                <input
                    type="text"
                    placeholder="Add new todo"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                />
                <button onClick={handleAddTodo}>Add</button>
            </div>

            <div>
                <label>Sort by:</label>
                <select value={sortCriteria} onChange={handleSortChange}>
                    <option value="id">ID</option>
                    <option value="title">Title</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div>
                <label>Search by:</label>
                <select value={searchCriteria} onChange={handleSearchCriteriaChange}>
                    <option value="title">Title</option>
                    <option value="id">ID</option>
                    <option value="completed">Completed</option>
                </select>
                <input
                    type="text"
                    placeholder={`Search by ${searchCriteria}`}
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </div>

            <ul>
                {filteredTodos.map(todo => (
                    <li key={todo.id}>
                        {editingTodoId === todo.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editedTodoTitle}
                                    onChange={(e) => setEditedTodoTitle(e.target.value)}
                                />
                                <button onClick={() => handleSaveEditTodo(todo.id)}>Save</button>
                                <button onClick={() => setEditingTodoId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                                />
                                <span>{todo.title}</span>
                                <button onClick={() => handleEditTodo(todo)}>Edit</button>
                                <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Todos;