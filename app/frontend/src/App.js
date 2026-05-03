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
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MemoryIcon from '@mui/icons-material/Memory';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C3AED' },
    secondary: { main: '#06B6D4' },
    background: { default: '#0F0F1A', paper: '#1A1A2E' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
        },
      },
    },
  },
});

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" elevation={0} sx={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        borderBottom: '1px solid rgba(124,58,237,0.3)',
      }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <SmartToyIcon sx={{ color: '#7C3AED', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} sx={{
            background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI Agent Chat
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>

        {/* Config card */}
        <Paper elevation={0} sx={{
          p: 3,
          border: '1px solid rgba(124,58,237,0.2)',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              Agent Configuration
            </Typography>
          </Box>

          <TextField
            label="System Prompt"
            placeholder="Define your agent's behavior — e.g. You are a concise assistant that speaks like a pirate."
            multiline
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 240 }} disabled={modelsLoading}>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MemoryIcon sx={{ fontSize: 16 }} /> Model
                </Box>
              </InputLabel>
              <Select value={model} label="Model" onChange={(e) => setModel(e.target.value)}>
                {models.map((m) => (
                  <MenuItem key={m} value={m}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                      {m}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={allowSearch}
                  onChange={(e) => setAllowSearch(e.target.checked)}
                  sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TravelExploreIcon sx={{ fontSize: 18, color: allowSearch ? 'secondary.main' : 'text.secondary' }} />
                  <Typography variant="body2" color={allowSearch ? 'secondary.main' : 'text.secondary'}>
                    Web Search
                  </Typography>
                  {allowSearch && <Chip label="ON" size="small" color="secondary" sx={{ height: 18, fontSize: 10 }} />}
                </Box>
              }
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(124,58,237,0.2)' }} />

          <TextField
            label="Your Message"
            placeholder="Ask anything... (Ctrl+Enter to send)"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            variant="outlined"
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              Ctrl + Enter to send
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
              sx={{
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                px: 4,
                '&:hover': { background: 'linear-gradient(135deg, #6D28D9, #0891B2)' },
                '&:disabled': { opacity: 0.5 },
              }}
            >
              {loading ? 'Thinking...' : 'Send'}
            </Button>
          </Box>
        </Paper>

        {/* Response card */}
        {(response || error || loading) && (
          <Paper elevation={0} sx={{
            p: 3,
            mt: 3,
            border: '1px solid rgba(6,182,212,0.2)',
            background: 'linear-gradient(135deg, #0F1923 0%, #0F1F2E 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700} color="secondary.main">
                Response
              </Typography>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(6,182,212,0.2)' }} />

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={20} color="secondary" />
                <Typography color="text.secondary" variant="body2">Agent is thinking...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, color: 'text.primary' }}>
                {response}
              </Typography>
            )}
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
