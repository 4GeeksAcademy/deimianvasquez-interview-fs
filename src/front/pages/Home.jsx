import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { dispatch } = useGlobalReducer()
	const backendUrl = import.meta.env.VITE_BACKEND_URL
	const [editingTodoId, setEditingTodoId] = React.useState(null)
	const [editingTitle, setEditingTitle] = React.useState("")
	const [localTodos, setLocalTodos] = React.useState([])
	const [localNewTodo, setLocalNewTodo] = React.useState("")

	const loadTodos = async () => {
		try {
			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/todos")
			const data = await response.json()

			if (response.ok) setLocalTodos((prev) => [...prev, ...data])

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the todos from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	const handleAddTodo = async (event) => {
		event.preventDefault()

		const response = await fetch(backendUrl + "/api/todos", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ title: localNewTodo })
		})

		const data = await response.json()
		if (response.ok) {
			setLocalTodos([...localTodos, data])
			setLocalNewTodo("")
			loadTodos()
		}
	}

	const handleEnterSubmit = (event) => {
		event.preventDefault()
	}

	const handleEditTodo = async () => {
		if (!editingTodoId) return

		const response = await fetch(`${backendUrl}/api/todos/${editingTodoId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ title: editingTitle })
		})

		if (response.ok) {
			setEditingTodoId(null)
			setEditingTitle("")
		}
	}

	const handleToggle = async (id) => {
		const response = await fetch(`${backendUrl}/api/todos/${id}/toggle`, {
			method: "PATCH"
		})

		if (response.ok) {
			setLocalTodos(
				localTodos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
			)
		}
	}

	const handleDelete = async (id) => {
		const response = await fetch(`${backendUrl}/api/todos/delete/${id}`)
		if (response.ok) {
			setLocalTodos(localTodos.filter((todo) => todo.id !== id))
		}
	}

	useEffect(() => {
		loadTodos()
	}, [])

	return (
		<div className="container mt-5" style={{ maxWidth: "700px" }}>
			<h1 className="mb-4">Technical Interview Todo List</h1>

			<form className="d-flex gap-2 mb-4" onSubmit={handleEnterSubmit}>
				<input
					type="text"
					className="form-control"
					placeholder="Add a task"
					value={localNewTodo}
					onChange={() => null}
				/>
				<button className="btn btn-primary" type="button" onClick={handleAddTodo}>Add</button>
			</form>

			<ul className="list-group">
				{localTodos.map((todo, index) => (
					<li key={index} className="list-group-item d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center gap-2 flex-grow-1">
							<input
								type="checkbox"
								checked={todo.done}
								onChange={() => handleToggle(todo.id)}
							/>
							{editingTodoId === todo.id ? (
								<input
									type="text"
									className="form-control"
									value={editingTitle}
									onChange={(e) => setEditingTitle(e.target.value)}
								/>
							) : (
								<span style={{ textDecoration: todo.done ? "line-through" : "none" }}>{todo.title}</span>
							)}
						</div>
						<div className="d-flex gap-2">
							{editingTodoId === todo.id ? (
								<button className="btn btn-sm btn-success" onClick={handleEditTodo}>Save</button>
							) : (
								<button
									className="btn btn-sm btn-outline-secondary"
									onClick={() => {
										setEditingTodoId(todo.id)
										setEditingTitle(todo.title)
									}}
								>
									Edit
								</button>
							)}
							<button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(todo.id)}>
								Delete
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};