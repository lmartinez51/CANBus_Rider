const axios = require('axios');
const chatAssistant = require('../chatAssistant');

jest.mock('axios');

describe('chatAssistant', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Speed up tests by mocking delay
        jest.spyOn(chatAssistant, 'delay').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('create_thread', () => {
        it('should throw an error if axios.post fails', async () => {
            axios.post.mockRejectedValueOnce(new Error('API error'));
            await expect(chatAssistant.create_thread('Lorenzo', 'Hello')).rejects.toThrow('API error');
        });
    });

    describe('create_message', () => {
        it('should throw an error if axios.post fails', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network error'));
            await expect(chatAssistant.create_message('thread_123', 'Hello')).rejects.toThrow('Network error');
        });
    });

    describe('run_assistant', () => {
        it('should throw error when run status is failed', async () => {
            axios.post.mockResolvedValueOnce({ data: { id: 'run_123' } });
            axios.get.mockResolvedValueOnce({ data: { status: 'failed' } });

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123')).rejects.toThrow('Run failed');
        });

        it('should throw error when axios.get inside run polling fails', async () => {
            axios.post.mockResolvedValueOnce({ data: { id: 'run_123' } });
            axios.get.mockRejectedValueOnce(new Error('GET error'));

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123')).rejects.toThrow('GET error');
        });

        it('should complete successfully when status is completed', async () => {
            axios.post.mockResolvedValueOnce({ data: { id: 'run_123' } });
            axios.get.mockResolvedValueOnce({ data: { status: 'completed' } });

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123')).resolves.not.toThrow();
        });
    });

    describe('createChatCompletion', () => {
        it('should return 500 status on error', async () => {
            const req = { body: { message: 'Hello' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            axios.post.mockRejectedValueOnce(new Error('Failed to create thread'));

            await chatAssistant.createChatCompletion(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Failed to create thread' });
        });

        it('should return message response on success', async () => {
            const req = { body: { message: 'Hello' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };

            // create_thread -> axios.post (threads) and create_message -> axios.post (messages)
            axios.post.mockResolvedValueOnce({ data: { id: 'thread_123' } }); // create_thread
            axios.post.mockResolvedValueOnce({ data: {} }); // create_message in create_thread
            axios.post.mockResolvedValueOnce({ data: { id: 'run_123' } }); // run_assistant
            axios.get.mockResolvedValueOnce({ data: { status: 'completed' } }); // run_assistant status check
            axios.get.mockResolvedValueOnce({ // response messages fetch
                data: {
                    data: [
                        {
                            content: [
                                { text: { value: 'Hello back!' } }
                            ]
                        }
                    ]
                }
            });

            await chatAssistant.createChatCompletion(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: 'Hello back!' });
        });
    });
});
