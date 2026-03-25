const Board = require('../models/Board');
const Task = require('../models/Task');

const updatePresence = (io, boardId) => {
    const count = io.sockets.adapter.rooms.get(boardId)?.size || 0;
    io.to(boardId).emit('userCount', count);
};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinBoard', async (boardId) => {
            try {
                if (!boardId) {
                    return socket.emit('error', 'Board ID required');
                }

                const board = await Board.findById(boardId);
                if (!board) {
                    return socket.emit('error', 'Board not found');
                }

                socket.join(boardId);
                socket.currentBoard = boardId;

                updatePresence(io, boardId);

                console.log(`User ${socket.id} joined board: ${boardId}`);
            } catch (error) {
                console.error(error);
                socket.emit('error', 'Join failed');
            }
        });

        socket.on('createTask', async (data) => {
            try {
                if (!data || !data.board) {
                    return socket.emit('error', 'Invalid task data');
                }

                const task = new Task(data);
                await task.save();

                io.to(data.board).emit('taskCreated', task);
            } catch (error) {
                console.error(error);
                socket.emit('error', error.message || 'Failed to create task');
            }
        });

        socket.on('moveTask', async ({ taskId, newStatus, boardId }) => {
            try {
                if (!taskId || !newStatus || !boardId) {
                    return socket.emit('error', 'Invalid move request');
                }

                const updatedTask = await Task.findByIdAndUpdate(
                    taskId,
                    { status: newStatus },
                    { new: true }
                );

                if (!updatedTask) {
                    return socket.emit('error', 'Task not found');
                }

                io.to(boardId).emit('taskMoved', updatedTask);
            } catch (error) {
                console.error(error);
                socket.emit('error', 'Update failed');
            }
        });

        socket.on('deleteTask', async ({ taskId, boardId }) => {
            try {
                if (!taskId || !boardId) {
                    return socket.emit('error', 'Invalid delete request');
                }

                const deletedTask = await Task.findByIdAndDelete(taskId);

                if (!deletedTask) {
                    return socket.emit('error', 'Task not found');
                }

                // Sending only ID
                io.to(boardId).emit('taskDeleted', { taskId });

            } catch (error) {
                console.error(error);
                socket.emit('error', 'Delete failed');
            }
        });

        socket.on('disconnect', () => {
            const boardId = socket.currentBoard;

            if (boardId) {
                updatePresence(io, boardId);
            }

            console.log('User disconnected:', socket.id);
        });
    });
};