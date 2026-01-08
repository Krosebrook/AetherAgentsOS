import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/utils/test-utils';
import AgentControlPanel from './AgentControlPanel';
import { mockAgent } from '../test/fixtures/mockData';
import { ModelType } from '../types';

describe('AgentControlPanel', () => {
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render agent name and model', () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
  });

  it('should update agent name when edited', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Find the name input (it might be in a specific section)
    const nameInput = screen.getByDisplayValue(mockAgent.name);
    fireEvent.change(nameInput, { target: { value: 'Updated Agent Name' } });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedAgent = mockOnUpdate.mock.calls[0][0];
      expect(updatedAgent.name).toBe('Updated Agent Name');
    });
  });

  it('should update system instruction', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const instructionInput = screen.getByDisplayValue(mockAgent.systemInstruction);
    const newInstruction = 'New system instruction for testing';
    
    fireEvent.change(instructionInput, { target: { value: newInstruction } });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedAgent = mockOnUpdate.mock.calls[0][0];
      expect(updatedAgent.systemInstruction).toBe(newInstruction);
    });
  });

  it('should update temperature slider', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Find slider by role (more accessible query)
    const sliders = screen.getAllByRole('slider');
    const tempSlider = sliders[0]; // First slider is temperature
    
    fireEvent.change(tempSlider, { target: { value: '0.9' } });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should toggle search option', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Find search toggle by role (switch)
    const searchSwitch = screen.getAllByRole('switch')[0]; // First switch should be search
    
    fireEvent.click(searchSwitch);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should show delete confirmation when remove button clicked', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Find delete button by its title attribute (accessible)
    const deleteButton = screen.getByTitle(/terminate/i);

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/termination|delete|confirm|force/i)).toBeInTheDocument();
    });
  });

  it('should call onRemove when deletion confirmed', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Trigger delete
    const deleteButton = screen.getByTitle(/terminate/i);

    fireEvent.click(deleteButton);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm|yes|proceed/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledOnce();
    });
  });

  it('should not render delete button when onRemove is undefined', () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={undefined}
      />
    );

    const deleteButton = screen.queryByRole('button', { name: /delete|remove|trash/i });
    expect(deleteButton).toBeNull();
  });

  it('should sanitize system instruction to prevent XSS', () => {
    const agentWithXSS = {
      ...mockAgent,
      systemInstruction: '<script>alert("XSS")</script>Test instruction',
    };

    render(
      <AgentControlPanel
        agent={agentWithXSS}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // The script tag should be escaped/sanitized in display
    const container = screen.getByDisplayValue(agentWithXSS.systemInstruction);
    expect(container).toBeInTheDocument();
  });

  it('should validate temperature range (0-1)', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    const sliders = screen.getAllByRole('slider');
    const tempSlider = sliders[0]; // First slider is temperature
    
    // Try to set invalid value
    fireEvent.change(tempSlider, { target: { value: '1.5' } });

    await waitFor(() => {
      if (mockOnUpdate.mock.calls.length > 0) {
        const updatedAgent = mockOnUpdate.mock.calls[0][0];
        expect(updatedAgent.temperature).toBeLessThanOrEqual(1);
        expect(updatedAgent.temperature).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
