import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function App() {
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [allowSearch, setAllowSearch] = useState(false);
  const [model, setModel] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/supported-models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        setModel(data[0] ?? '');
      })
      .finally(() => setModelsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: model,
          system_prompt: systemPrompt,
          messages: [message],
          allow_search: allowSearch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Request failed');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" fontWeight={600}>
            AI Agent Chat
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
            Agent Configuration
          </Typography>

          <TextField
            label="System Prompt"
            placeholder="Define your AI agent's behavior (e.g. You are a helpful assistant that answers concisely.)"
            multiline
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 240 }} disabled={modelsLoading}>
              <InputLabel>Model</InputLabel>
              <Select value={model} label="Model" onChange={(e) => setModel(e.target.value)}>
                {models.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={allowSearch}
                  onChange={(e) => setAllowSearch(e.target.checked)}
                />
              }
              label="Allow Web Search"
            />
          </Box>

          <Divider />

          <TextField
            label="Your Message"
            placeholder="Enter your prompt here..."
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending...' : 'Submit'}
            </Button>
          </Box>
        </Paper>

        {(response || error) && (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Response
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{response}</Typography>
            )}
          </Paper>
        )}
      </Container>
    </>
  );
}

export default App;
