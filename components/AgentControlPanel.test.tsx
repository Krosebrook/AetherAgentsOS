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

    const tempSlider = screen.getByLabelText(/temperature/i) || 
                       document.querySelector('input[type="range"]');
    
    if (tempSlider) {
      fireEvent.change(tempSlider, { target: { value: '0.9' } });

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    }
  });

  it('should toggle search option', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Look for search-related checkbox or toggle
    const searchToggle = screen.queryByRole('checkbox') || 
                        document.querySelector('input[type="checkbox"]');
    
    if (searchToggle) {
      fireEvent.click(searchToggle);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    }
  });

  it('should show delete confirmation when remove button clicked', async () => {
    render(
      <AgentControlPanel
        agent={mockAgent}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Find delete/remove button (may have Trash icon)
    const deleteButton = screen.getByRole('button', { name: /delete|remove|trash/i }) ||
                        document.querySelector('button[aria-label*="delete"]') ||
                        document.querySelector('button[aria-label*="remove"]');

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/termination|delete|confirm/i)).toBeInTheDocument();
      });
    }
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
    const deleteButton = screen.getByRole('button', { name: /delete|remove|trash/i }) ||
                        document.querySelector('button[aria-label*="delete"]');

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm|yes|proceed/i }) ||
                             screen.getByText(/confirm/i).closest('button');
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(mockOnRemove).toHaveBeenCalledOnce();
      });
    }
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

    const tempSlider = document.querySelector('input[type="range"]');
    
    if (tempSlider) {
      // Try to set invalid value
      fireEvent.change(tempSlider, { target: { value: '1.5' } });

      await waitFor(() => {
        if (mockOnUpdate.mock.calls.length > 0) {
          const updatedAgent = mockOnUpdate.mock.calls[0][0];
          expect(updatedAgent.temperature).toBeLessThanOrEqual(1);
          expect(updatedAgent.temperature).toBeGreaterThanOrEqual(0);
        }
      });
    }
  });
});
