import { LightningElement, track } from 'lwc';
import submitClaim from '@salesforce/apex/ClaimIntakeController.submitClaim';

export default class ClaimIntakeChat extends LightningElement {
    @track userMessage = '';
    @track isSending = false;
    @track messages = [
        {
            id: 0,
            role: 'Agent',
            text: 'Welcome to claims intake. Please describe your claim in plain language.',
            cssClass: 'agent-message'
        }
    ];

    handleMessageChange(event) {
        this.userMessage = event.target.value;
    }

    handleSend() {
        if (!this.userMessage.trim()) {
            return;
        }

        const userMessage = this.userMessage.trim();
        this.messages = [
            ...this.messages,
            {
                id: this.messages.length,
                role: 'You',
                text: userMessage,
                cssClass: 'user-message'
            }
        ];
        this.userMessage = '';
        this.isSending = true;

        submitClaim({ message: userMessage })
            .then((response) => {
                this.messages = [
                    ...this.messages,
                    {
                        id: this.messages.length,
                        role: 'Agent',
                        text: response,
                        cssClass: 'agent-message'
                    }
                ];
            })
            .catch((error) => {
                this.messages = [
                    ...this.messages,
                    {
                        id: this.messages.length,
                        role: 'Agent',
                        text: 'Sorry, something went wrong while processing your message.',
                        cssClass: 'agent-message'
                    }
                ];
                console.error(error);
            })
            .finally(() => {
                this.isSending = false;
            });
    }
}
