import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface List {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

const TODO_API_URL = 'http://localhost:5000/list';

function Todo() {
    const queryClient = useQueryClient();
    const [newTodo, setNewTodo] = useState<{ name: string; quantity: number; price: number }>({
        name: '',
        quantity: 1,
        price: 0,
    });

    const { data: todos, isLoading } = useQuery<List[]>({
        queryKey: ['todos'],
        queryFn: async () => {
            const res = await fetch(TODO_API_URL);
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        },
    });

    const addTodoMutation = useMutation({
        mutationFn: (newTodo: { name: string; quantity: number; price: number }) => {
            return fetch(TODO_API_URL, {
                method: 'POST',
                body: JSON.stringify(newTodo),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['todos']);
        },
    });

    const updateTodoMutation = useMutation({
        mutationFn: (updatedTodo: List) => {
            return fetch(`${TODO_API_URL}/${updatedTodo.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedTodo),
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['todos']);
        },
    });

    const deleteTodoMutation = useMutation({
        mutationFn: (todoId: number) => {
            return fetch(`${TODO_API_URL}/${todoId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['todos']);
        },
    });

    const handleAddTodo = () => {
        if (!newTodo.name) return;

        addTodoMutation.mutate(newTodo);
        
        setNewTodo({ name: '', quantity:0, price: 0 });
    };

    const handleUpdateTodo = (todo: List) => {
        const updatedTodo = { ...todo, quantity: todo.quantity + 1 };  
        updateTodoMutation.mutate(updatedTodo);
    };

    const handleDeleteTodo = (todoId: number) => {
        deleteTodoMutation.mutate(todoId);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <main className='flex flex-col items-center justify-between p-4'>
            <h1 style={{ color: 'blue' }}>Todos</h1>
            name
            <input
                type="text"
                value={newTodo.name}
                onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
                placeholder="name"
            />
            Quantity
            <input
                type="text"
                value={newTodo.quantity}
                onChange={(e) => setNewTodo({ ...newTodo, quantity: Number(e.target.value) })}
                placeholder="Quantity"
            />
            price
            <input
                type="text"
                value={newTodo.price}
                onChange={(e) => setNewTodo({ ...newTodo, price: Number(e.target.value) })}
                placeholder="Price"
            />
            <button onClick={handleAddTodo}>Add Todo</button>
            <div>
                {todos?.map((todo) => (
                    <div key={todo.id} className="flex justify-between items-center">
                        <h2>
                            {todo.name} (Quantity: {todo.quantity}, Price: {todo.price})
                        </h2>
                        <button onClick={() => handleUpdateTodo(todo)}>Update</button>
                        <button onClick={() => handleDeleteTodo(todo.id)}>Remove</button>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default Todo;
