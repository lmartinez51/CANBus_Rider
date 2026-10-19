const chatAssistant = require('./chatAssistant');
const axios = require('axios');

jest.mock('axios');

describe('chatAssistant', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {
                message: 'Hello Assistant'
            }
        };
        res = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('run_assistant', () => {
        it('should throw an error if polling axios.get fails', async () => {
            axios.post.mockResolvedValueOnce({
                data: { id: 'run_123' }
            });
            axios.get.mockRejectedValueOnce(new Error('Network error during polling'));

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123'))
                .rejects.toThrow('Network error during polling');
        });

        it('should throw an error if status is failed', async () => {
            axios.post.mockResolvedValueOnce({
                data: { id: 'run_123' }
            });
            axios.get.mockResolvedValueOnce({
                data: { status: 'failed' }
            });

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123'))
                .rejects.toThrow('Assistant run failed');
        });

        it('should poll status until status is completed', async () => {
            const delaySpy = jest.spyOn(chatAssistant, 'delay').mockImplementation(() => Promise.resolve());
            axios.post.mockResolvedValueOnce({
                data: { id: 'run_123' }
            });
            axios.get
                .mockResolvedValueOnce({ data: { status: 'in_progress' } })
                .mockResolvedValueOnce({ data: { status: 'completed' } });

            await expect(chatAssistant.run_assistant('thread_123', 'assistant_123', 500))
                .resolves.not.toThrow();
            expect(delaySpy).toHaveBeenCalledWith(500);
            delaySpy.mockRestore();
        });
    });

    describe('createChatCompletion', () => {
        it('should return 500 when an error occurs in flow', async () => {
            // Force create_thread/run_assistant failure
            axios.post.mockRejectedValueOnce(new Error('OpenAI API Error'));

            await chatAssistant.createChatCompletion(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'OpenAI API Error' });
        });
    });

    describe('create_thread', () => {
        it('should rethrow error if axios.post fails', async () => {
            axios.post.mockRejectedValueOnce(new Error('Thread creation failed'));

            await expect(chatAssistant.create_thread('user1', 'hello'))
                .rejects.toThrow('Thread creation failed');
        });
    });

    describe('create_message', () => {
        it('should rethrow error if axios.post fails', async () => {
            axios.post.mockRejectedValueOnce(new Error('Message creation failed'));

            await expect(chatAssistant.create_message('thread_123', 'hello'))
                .rejects.toThrow('Message creation failed');
        });
    });
});
