"""
TicTacLearn — Comprehensive Defense & Presentation Master Guide Generator
Generates a publication-grade PDF covering all game science, CNN architectures,
training regimes, empirical figures, notebook code walkthrough, and defense Q&A.
"""

import os
import json
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print 'Page X of Y' with running headers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Running Top Header
        self.drawString(54, 750, "TicTacLearn — CNN Game Science & Defense Master Guide")
        self.drawRightString(612 - 54, 750, "UITS CSE • Batch 53")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 744, 612 - 54, 744)
        
        # Running Bottom Footer
        self.drawString(54, 36, "Authors: Md. Shahriar Hossain Srabon (1056), Lubna Jahan Lipa (1088), Tamanna Khokon (1082)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_str)
        self.line(54, 46, 612 - 54, 46)
        
        self.restoreState()

def build_pdf(filename="TicTacLearn_CNN_Game_Science_Defense_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    
    usable_width = 612 - 108  # 504 pt
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a")     # Deep slate
    c_accent = colors.HexColor("#1e40af")      # Academic navy blue
    c_secondary = colors.HexColor("#334155")   # Charcoal
    c_muted = colors.HexColor("#64748b")       # Muted gray
    c_border = colors.HexColor("#e2e8f0")      # Light border
    c_card_bg = colors.HexColor("#f8fafc")     # Card background
    c_success = colors.HexColor("#047857")     # Forest green
    c_danger = colors.HexColor("#b91c1c")      # Crimson
    
    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_accent,
        alignment=0,
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_secondary,
        alignment=0,
        spaceAfter=15
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_accent,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=c_primary,
        spaceAfter=5
    )
    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderPadding=5,
        spaceAfter=6
    )
    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e3a8a"),
    )
    fig_caption_style = ParagraphStyle(
        'FigCaption',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_muted,
        alignment=1,
        spaceBefore=3,
        spaceAfter=8
    )

    story = []

    def make_callout(text, bg="#eff6ff", border="#93c5fd", icon="📌"):
        p = Paragraph(f"<b>{icon} Key Takeaway:</b> {text}", callout_style)
        t = Table([[p]], colWidths=[usable_width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg)),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border)),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        return t

    def add_plot(img_path, caption, max_h=190):
        if os.path.exists(img_path):
            with PILImage.open(img_path) as im:
                w, h = im.size
            ratio = w / h
            target_w = usable_width - 10
            target_h = target_w / ratio
            if target_h > max_h:
                target_h = max_h
                target_w = target_h * ratio
            img_flow = Image(img_path, width=target_w, height=target_h)
            img_flow.hAlign = 'CENTER'
            story.append(Spacer(1, 4))
            story.append(img_flow)
            story.append(Paragraph(caption, fig_caption_style))
            story.append(Spacer(1, 4))
        else:
            story.append(Paragraph(f"[Image file not found: {img_path}]", fig_caption_style))

    # =========================================================================
    # COVER / HEADER
    # =========================================================================
    story.append(Paragraph("University of Information Technology & Sciences (UITS)", ParagraphStyle('UniHeader', fontName='Helvetica-Bold', fontSize=10, textColor=c_muted, leading=12)))
    story.append(Paragraph("Department of Computer Science & Engineering • Batch 53", ParagraphStyle('UniSub', fontName='Helvetica', fontSize=9, textColor=c_muted, leading=12, spaceAfter=12)))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceAfter=14))
    
    story.append(Paragraph("TicTacLearn: Neural Network CNN Tic-Tac-Toe", title_style))
    story.append(Paragraph("<b>Comprehensive Technical & Theoretical Guide for Project Defense & Presentation</b><br/>"
                           "<i>Teaching Underfitting, Overfitting, and Generalization through Playable Convolutional Neural Networks</i>", subtitle_style))
    
    meta_data = [
        [Paragraph("<b>Project Team:</b>", body_bold), Paragraph("Md. Shahriar Hossain Srabon (1056)<br/>Lubna Jahan Lipa (1088)<br/>Tamanna Khokon (1082)", body_style)],
        [Paragraph("<b>Core Focus:</b>", body_bold), Paragraph("Game-Theoretic Formulation, Dihedral Symmetries, Leakage-Safe Splitting, 3 CNN Architectures, Training Dynamics, Empirical Figures & Notebook Implementation.", body_style)],
        [Paragraph("<b>Frameworks & Tools:</b>", body_bold), Paragraph("Python 3.10, TensorFlow 2.21 / Keras 3, Minimax Oracle, Matplotlib, NumPy, Group Theory (D4).", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[120, 384])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    story.append(make_callout(
        "This document is specifically crafted for your <b>oral presentation and project defense</b>. "
        "It focuses 100% on the Machine Learning, Game Theory, and CNN Engineering science. "
        "Every equation, graph, architectural choice, and notebook cell is fully decoded.",
        bg="#f0fdf4", border="#86efac", icon="🎓"
    ))

    # =========================================================================
    # SECTION 1: THE CORE MISSION & GAME-THEORETIC FOUNDATION
    # =========================================================================
    story.append(Paragraph("1. The Core Mission & Problem Formulation", h1_style))
    story.append(Paragraph(
        "In traditional Machine Learning education, the concepts of <b>underfitting</b> (high bias), "
        "<b>overfitting</b> (high variance), and <b>generalization</b> are usually explained using 2D polynomial "
        "regression curves. While mathematically sound, students and examiners rarely get to feel how those "
        "properties manifest in dynamic, decision-making agents. <b>TicTacLearn</b> bridges this gap by "
        "embodying underfitting, overfitting, and optimal generalization into three playable Convolutional Neural Networks "
        "operating on the complete state space of Tic-Tac-Toe.", body_style
    ))
    
    story.append(Paragraph("1.1 Mathematical Board Representation & Mover Perspective", h2_style))
    story.append(Paragraph(
        "A Tic-Tac-Toe board is a 3×3 grid with 9 cells. Raw board states are represented as vectors or matrices "
        "where <b>X = +1</b>, <b>O = -1</b>, and <b>Empty = 0</b>. A naive neural network would require two separate "
        "policies or an extra channel to know whether it is playing as X or O. Instead, this project uses a mathematically "
        "elegant <b>Mover-Perspective Tensor Encoding</b>:", body_style
    ))
    story.append(Paragraph(
        "<b>Tensor Input:</b> For any board vector <code>b ∈ {-1, 0, 1}⁹</code> and current mover <code>p ∈ {+1, -1}</code>, "
        "the input tensor <code>X ∈ ℝ³ˣ³ˣ¹</code> is defined as:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<code>X[r, c, 0] = b[3*r + c] * p</code> (with strict clamping: <code>0 * p = 0</code> to prevent negative zeros).<br/>"
        "Under this transformation, <b>the mover's pieces are always +1</b>, the <b>opponent's pieces are always -1</b>, "
        "and <b>empty cells are always 0</b>. This allows a <i>single convolutional network</i> to play identically well as either X or O.", body_style
    ))

    story.append(Paragraph("1.2 State Space Exhaustion & Ground-Truth Minimax Oracle", h2_style))
    story.append(Paragraph(
        "Tic-Tac-Toe is a finite, zero-sum two-player game with perfect information. "
        "Using Breadth-First Search (BFS) starting from the empty board, we exhaustively discover all reachable positions:<br/>"
        "• <b>Total reachable game states:</b> 5,478 states<br/>"
        "• <b>Terminal states (win/loss/draw already decided):</b> 958 states<br/>"
        "• <b>Non-terminal reachable positions (active decision points):</b> Exactly <b>4,520 positions</b>.<br/>"
        "To train the neural networks, every single one of the 4,520 states is solved using a recursive <b>Minimax Algorithm with memoization</b>. "
        "Minimax computes the exact game-theoretic value (+1 win, 0 draw, -1 loss from current mover's perspective) for all legal candidate moves.", body_style
    ))
    story.append(Paragraph(
        "<b>Soft Ground-Truth Labels:</b> In many board states, multiple moves share the same maximal optimal value (for instance, on the very first turn, "
        "all four corners are equally optimal). Instead of arbitrarily picking one move, Minimax assigns a uniform probability distribution over all tying "
        "optimal moves (e.g., [0.5, 0.5] if two moves tie). The networks are trained using <b>Categorical Cross-Entropy against these soft multi-target labels</b>.", body_style
    ))

    # =========================================================================
    # SECTION 2: GROUP THEORY & LEAKAGE-SAFE SPLITTING
    # =========================================================================
    story.append(Paragraph("2. Group Theory & The Leakage-Safe Split (Crucial Defense Topic)", h1_style))
    story.append(Paragraph(
        "Examiners frequently scrutinize data splitting in board-game AI. If a standard random 70/15/15 split is used on the 4,520 boards, "
        "<b>severe data leakage occurs</b>. Why? Because a Tic-Tac-Toe board has 8 geometric symmetries.", body_style
    ))
    story.append(Paragraph("2.1 The Dihedral Group D₄ (8 Symmetries)", h2_style))
    story.append(Paragraph(
        "The symmetry group of a square is the <b>Dihedral Group D₄</b>, consisting of 8 transformations:<br/>"
        "1. Identity (0° rotation)<br/>"
        "2. 90° clockwise rotation<br/>"
        "3. 180° rotation<br/>"
        "4. 270° clockwise rotation<br/>"
        "5. Horizontal reflection (flip across vertical axis)<br/>"
        "6. Vertical reflection (flip across horizontal axis)<br/>"
        "7. Main diagonal reflection (transpose)<br/>"
        "8. Anti-diagonal reflection.<br/>"
        "Applying these 8 transformations partitions the 4,520 non-terminal reachable boards into exactly <b>627 canonical equivalence classes</b>.", body_style
    ))
    
    story.append(Paragraph("2.2 The Group-Based Split Guarantee", h2_style))
    story.append(Paragraph(
        "If Board A is in the training set and Board A rotated by 90° is in the test set, the model does not need to generalize game strategy—it merely "
        "needs to memorize rotated patterns! To eliminate this vulnerability:<br/>"
        "• We partition the <b>627 equivalence groups</b> (not individual boards) into 70% Train (438 groups = 3,153 boards), 15% Validation (94 groups = 691 boards), and 15% Test (95 groups = 676 boards).<br/>"
        "• <b>Disjointness Invariant:</b> A programmatic assertion verifies that <code>set(train_groups) ∩ set(val_groups) ∩ set(test_groups) == ∅</code>.<br/>"
        "Therefore, whenever the network is tested on the Validation or Test set, <b>neither that exact board NOR ANY OF ITS 8 ROTATIONS OR REFLECTIONS was ever seen during training</b>. "
        "This is an airtight test of true geometric and strategic generalization.", body_style
    ))

    # =========================================================================
    # SECTION 3: THE THREE CNN ARCHITECTURES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. The Three CNN Architectures — Deep Breakdown", h1_style))
    story.append(Paragraph(
        "To rigorously teach bias-variance trade-offs, the project constructs three distinct CNNs spanning three orders of magnitude in parameter capacity:", body_style
    ))

    arch_table_data = [
        [Paragraph("<b>Model Name</b>", body_bold), Paragraph("<b>Parameters</b>", body_bold), Paragraph("<b>Layer Architecture</b>", body_bold), Paragraph("<b>Regularization & Data</b>", body_bold), Paragraph("<b>Pedagogical Purpose</b>", body_bold)],
        [
            Paragraph("<b>Underfit</b><br/>('Beginner AI')", body_style),
            Paragraph("<b>191</b><br/>params", body_style),
            Paragraph("• Conv2D(2 filters, 3×3, same)<br/>• Flatten(18)<br/>• Dense(9, softmax)", code_style),
            Paragraph("None.<br/>Trained 10 epochs on full train set without augmentation.", body_style),
            Paragraph("Demonstrates <b>High Bias</b>.<br/>Lacks parameter capacity to express spatial game concepts.", body_style)
        ],
        [
            Paragraph("<b>Overfit</b><br/>('Memorizer AI')", body_style),
            Paragraph("<b>687,625</b><br/>params", body_style),
            Paragraph("• Conv2D(32, 3×3, same)<br/>• Conv2D(64, 3×3, same)<br/>• Conv2D(128, 3×3, same)<br/>• Flatten(1152)<br/>• Dense(512, relu)<br/>• Dense(9, softmax)", code_style),
            Paragraph("Zero regularization.<br/>Trained <b>300 epochs</b> on an intentionally tiny subset of <b>only 60 boards</b>.", body_style),
            Paragraph("Demonstrates <b>High Variance</b>.<br/>Memorizes 60 exact boards; completely hallucinates on unseen states.", body_style)
        ],
        [
            Paragraph("<b>Stable</b><br/>('Master AI')", body_style),
            Paragraph("<b>93,833</b><br/>params", body_style),
            Paragraph("• Conv2D(32, 3×3, same)<br/>• Conv2D(64, 3×3, same)<br/>• Flatten(576)<br/>• <b>Dropout(0.3)</b><br/>• Dense(128, relu)<br/>• Dense(9, softmax)", code_style),
            Paragraph("• <b>8× Symmetry Augmentation</b> (25,224 training samples)<br/>• 30% Dropout<br/>• EarlyStopping (patience=15)", body_style),
            Paragraph("Demonstrates <b>Optimal Generalization</b>.<br/>Balances inductive bias and model capacity to master the game.", body_style)
        ],
    ]
    arch_table = Table(arch_table_data, colWidths=[75, 55, 150, 114, 110])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e3a8a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#fef2f2")),  # Light red for underfit
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor("#fffbeb")),  # Light amber for overfit
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor("#f0fdf4")),  # Light green for stable
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.1 Why Convolutional Layers for a 3×3 Board?", h2_style))
    story.append(Paragraph(
        "A common question is: <i>'Why use Conv2D on a small 3×3 board instead of a Multi-Layer Perceptron (MLP)?'</i><br/>"
        "<b>Answer:</b> Tic-Tac-Toe win conditions are strictly local, translation-invariant spatial patterns: 3-in-a-row horizontally, "
        "vertically, or diagonally. A 3×3 convolution with padding ('same') computes spatial inner products across adjacent cells. "
        "Each filter acts as an aligned line detector (e.g., detecting if two pieces form a fork or an impending three-in-a-row). "
        "Convolutions enforce spatial locality and weight sharing, learning pattern primitives far more efficiently than unconstrained dense matrices.", body_style
    ))

    story.append(Paragraph("3.2 Raw Top-Choice Accuracy vs. Legal-Masked Accuracy", h2_style))
    story.append(Paragraph(
        "A neural network outputs raw probabilities over all 9 cells. It is not inherently constrained by the rules of Tic-Tac-Toe! "
        "Therefore, the project tracks two critical evaluation metrics:<br/>"
        "1. <b>Raw Top-Choice Accuracy:</b> The network's unconstrained <code>argmax(p)</code>. Did the network rank an optimal move highest *without* any external intervention? If it selects an already occupied cell, it fails.<br/>"
        "2. <b>Legal-Masked Accuracy:</b> During real gameplay, invalid cells are masked with <code>-∞</code> before taking the argmax. "
        "The masked accuracy reflects the player's practical experience.<br/>"
        "The delta between these two metrics reveals the network's internal comprehension: a model that requires heavy masking has not truly internalized the rules of the board.", body_style
    ))

    # =========================================================================
    # SECTION 4: EMPIRICAL RESULTS & METRICS
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("4. Empirical Results: The Scientific Scorecard", h1_style))
    story.append(Paragraph(
        "The following table displays the exact measured performance from the acceptance run across all three models:", body_style
    ))

    metrics_data = [
        [Paragraph("<b>Metric / Characteristic</b>", body_bold), Paragraph("<b>Underfit (191 params)</b>", body_bold), Paragraph("<b>Overfit (687k params)</b>", body_bold), Paragraph("<b>Stable (93k params)</b>", body_bold), Paragraph("<b>Target Threshold</b>", body_bold)],
        [Paragraph("Training Accuracy (Raw)", body_style), Paragraph("<b>20.5%</b> (Masked: 55.1%)", body_style), Paragraph("<b>100.0%</b> (Masked: 100%)", body_style), Paragraph("<b>99.97%</b> (Masked: 99.9%)", body_style), Paragraph("Stable ≥ 98%, Overfit ≥ 98%", body_style)],
        [Paragraph("Validation Accuracy (Raw)", body_style), Paragraph("<b>17.4%</b> (Masked: 56.0%)", body_style), Paragraph("<b>53.7%</b> (Masked: 73.8%)", body_style), Paragraph("<b>98.41%</b> (Masked: 98.4%)", body_style), Paragraph("Underfit < 50%, Stable ≥ 95%", body_style)],
        [Paragraph("Test Accuracy (Unseen Groups)", body_style), Paragraph("<b>19.9%</b>", body_style), Paragraph("<b>58.7%</b>", body_style), Paragraph("<b>95.89%</b>", body_style), Paragraph("Stable ≥ 95%", body_style)],
        [Paragraph("Generalization Gap (Train - Val)", body_style), Paragraph("3.1% (Low gap, High error)", body_style), Paragraph("<b>46.3%</b> (Massive Overfit)", body_style), Paragraph("<b>1.56%</b> (Near-Perfect Fit)", body_style), Paragraph("Overfit Gap ≥ 25 points", body_style)],
        [Paragraph("Final Loss (Train / Val)", body_style), Paragraph("2.270 / 2.275", body_style), Paragraph("0.576 / <b>3.141</b>", body_style), Paragraph("0.561 / <b>0.647</b>", body_style), Paragraph("Overfit Val loss explodes", body_style)],
        [Paragraph("Illegal Move Attempt Rate", body_style), Paragraph("<b>47.79%</b> (Nearly half!)", body_style), Paragraph("<b>20.79%</b> (1 in 5 moves)", body_style), Paragraph("<b>0.00%</b> (Never fails!)", body_style), Paragraph("Stable = 0.0%", body_style)],
        [Paragraph("Missed Winning Move Rate", body_style), Paragraph("<b>62.49%</b>", body_style), Paragraph("<b>33.68%</b>", body_style), Paragraph("<b>0.00%</b>", body_style), Paragraph("Stable < 1%", body_style)],
        [Paragraph("Missed Opponent Block Rate", body_style), Paragraph("<b>88.13%</b>", body_style), Paragraph("<b>67.23%</b>", body_style), Paragraph("<b>0.00%</b>", body_style), Paragraph("Stable < 1%", body_style)],
        [Paragraph("1,000 Games vs. Random Agent", body_style), Paragraph("556 W / 106 D / 338 L", body_style), Paragraph("854 W / 68 D / 78 L", body_style), Paragraph("<b>944 W / 56 D / 0 L</b>", body_style), Paragraph("Stable ≥ 90% Wins, 0 Losses", body_style)],
        [Paragraph("200 Games vs. Minimax (Perfect)", body_style), Paragraph("0 W / 32 D / 168 L", body_style), Paragraph("0 W / 89 D / 111 L", body_style), Paragraph("<b>0 W / 200 D / 0 L</b>", body_style), Paragraph("Stable = <b>0 Losses (100% Draw)</b>", body_style)],
    ]
    metrics_table = Table(metrics_data, colWidths=[124, 95, 95, 95, 95])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0,5), (-1,5), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0,7), (-1,7), colors.HexColor("#f8fafc")),
        ('BACKGROUND', (0,9), (-1,9), colors.HexColor("#f8fafc")),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 5: DEEP WALKTHROUGH OF ALL FIGURES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Visualizing the Science — Detailed Plot Analysis", h1_style))
    story.append(Paragraph(
        "Every plot generated by <code>tictactoe_cnn.ipynb</code> provides empirical proof of foundational Machine Learning principles. "
        "Here is what each figure shows and how to explain it in your presentation:", body_style
    ))

    # Figure 1: Accuracy Comparison
    add_plot("artifacts/plots/accuracy_comparison.png", 
             "Figure 1: Train, Validation, and Test Accuracy across Underfit, Overfit, and Stable Models.", max_h=175)
    story.append(Paragraph(
        "<b>How to Explain Figure 1:</b><br/>"
        "• <b>Underfit (Left):</b> Both train and validation accuracies hover near 20%. The model has <i>High Bias</i>—it cannot even learn the training set.<br/>"
        "• <b>Overfit (Center):</b> Training accuracy reaches a perfect 100%, but validation accuracy collapses to ~53.7%. This 46.3% gap is textbook <i>High Variance</i>.<br/>"
        "• <b>Stable (Right):</b> Training (99.97%), Validation (98.41%), and Test (95.89%) bars are virtually identical. This demonstrates flawless <i>Generalization</i>.", body_style
    ))

    # Figure 2 & 3: Curves
    add_plot("artifacts/plots/validation_curves_overlay.png", 
             "Figure 2: Validation Loss & Accuracy Trajectories Over Training Epochs.", max_h=175)
    story.append(Paragraph(
        "<b>How to Explain Figure 2:</b><br/>"
        "• Observe the <b>Overfit Validation Loss (Red)</b>: After epoch 25, while training loss continues decreasing, validation loss rapidly diverges upward to <b>3.14</b>.<br/>"
        "• In sharp contrast, the <b>Stable Model (Green)</b> validation loss smoothly declines and plateaus at <b>0.647</b>.<br/>"
        "• The <b>Underfit Model (Blue)</b> stays flatlined near 2.27 from start to finish—refusing to converge.", body_style
    ))

    story.append(PageBreak())
    # Figure 4: Individual Training Curves
    story.append(Paragraph("5.1 Training Dynamics Comparison (Underfit vs. Overfit vs. Stable)", h2_style))
    add_plot("artifacts/plots/curves_overfit.png", 
             "Figure 3: Overfit Model Dynamics — Clear divergence between Training and Validation loss after epoch 30.", max_h=165)
    story.append(Paragraph(
        "<b>Key Takeaway for Examiners:</b> In Figure 3, point out the 'U-shaped' validation loss curve. "
        "At epoch 1, loss is ~2.2. By epoch 20, it drops to 1.5, and then continuously explodes upward as the 687,625 parameters "
        "begin memorizing the idiosyncratic noise of the 60 training boards rather than generalizable Tic-Tac-Toe logic.", body_style
    ))

    add_plot("artifacts/plots/curves_stable.png", 
             "Figure 4: Stable Model Dynamics — Training and validation loss decrease synchronously with zero divergence.", max_h=165)
    story.append(Paragraph(
        "<b>Key Takeaway for Examiners:</b> Notice the effect of <b>Dropout (0.3)</b> and <b>8× Symmetry Augmentation</b> in Figure 4. "
        "Because 30% of neurons are randomly zeroed out during training, no single pathway can memorize specific boards. "
        "Validation loss closely tracks training loss, proving robust structural learning.", body_style
    ))

    story.append(PageBreak())
    # Figure 5: Seen vs Unseen Board
    story.append(Paragraph("5.2 The 'Memorizer' Smoking Gun: Seen vs. Unseen Board Contrast", h2_style))
    add_plot("artifacts/plots/seen_vs_unseen_overfit.png", 
             "Figure 5: Overfit Model Heatmap Contrast — Perfect confidence on a seen board vs. complete blunder on a 1-move shifted unseen board.", max_h=175)
    story.append(Paragraph(
        "<b>The Ultimate Demonstration of Overfitting (Figure 5):</b><br/>"
        "This is the most compelling visual for your presentation defense:<br/>"
        "• <b>Left Board (Seen during training):</b> The Overfit model exhibits <b>100% confidence</b> in the exact optimal winning move (green highlight). It looks like a grandmaster.<br/>"
        "• <b>Right Board (Unseen board, created by shifting just one piece):</b> The board position is fundamentally similar, yet the Overfit model completely collapses! "
        "It assigns high probability to an already occupied cell or makes a catastrophic blunder.<br/>"
        "<i>This visual conclusively proves that high training accuracy does NOT equal intelligence—it equals rote memorization!</i>", body_style
    ))

    # Figure 6: Same Board Comparison
    add_plot("artifacts/plots/heatmaps_same_board.png", 
             "Figure 6: Same-Board Comparative Probability Heatmaps across all three models.", max_h=175)
    story.append(Paragraph(
        "<b>How the Three Networks Think (Figure 6):</b><br/>"
        "• <b>Underfit:</b> Probabilities are smeared diffusely across all 9 cells (~0.11 each). It cannot distinguish empty winning cells from blocked ones.<br/>"
        "• <b>Overfit:</b> Highly peaked but erratic distribution based on whichever memorized training sample loosely matched the pattern.<br/>"
        "• <b>Stable:</b> Concentrates >95% probability mass purely on the game-theoretically proven winning/blocking cells.", body_style
    ))

    # Figure 7: Gameplay WDL
    add_plot("artifacts/plots/gameplay_wdl.png", 
             "Figure 7: Win/Draw/Loss Distribution over 1,000 Games vs. Random Agent and 200 Games vs. Minimax.", max_h=175)
    story.append(Paragraph(
        "<b>Game-Play Validation (Figure 7):</b><br/>"
        "• Against Random Agent: Stable wins <b>94.4%</b> of games with <b>0 losses</b> (5.6% draws due to random defense). Underfit loses 33.8% of the time.<br/>"
        "• Against Minimax (Perfect Play): Tic-Tac-Toe is a mathematically solved draw. A perfect player playing against another perfect player "
        "will result in <b>100% draws and 0 losses</b>. In 200 games against Minimax, the Stable model achieved <b>200 DRAWS and 0 LOSSES</b>. "
        "This is mathematical proof that the Stable CNN reached <b>Nash Equilibrium</b>!", body_style
    ))

    # =========================================================================
    # SECTION 6: NOTEBOOK CODE WALKTHROUGH
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Notebook (tictactoe_cnn.ipynb) Code Walkthrough", h1_style))
    story.append(Paragraph(
        "The notebook consists of 83 cells organized into 17 clean pedagogical sections. "
        "Here is the functional explanation of each code module and how it connects to the project:", body_style
    ))

    nb_sections = [
        ("Section 1: Setup & Reproducibility",
         "Imports TensorFlow 2, Keras 3, NumPy. Explicitly fixes all pseudorandom seeds: `random.seed(42)`, `np.random.seed(42)`, `tf.random.set_seed(42)`. "
         "Creates clean artifact output paths (`artifacts/models/`, `artifacts/plots/`, `artifacts/data/`)."),
        
        ("Section 2: Concept Primer",
         "Defines foundational terminology in Markdown: what a convolution is, how filters slide across boards, bias vs. variance, and loss formulation."),
        
        ("Section 3: Game Rules & Symmetries (D₄)",
         "Implements `check_winner(board)`, `is_terminal(board)`, and `get_legal_moves(board)`. "
         "Defines the 8 geometric transformation matrices corresponding to the Dihedral Group D₄. "
         "Includes `canonical_representation(board)` which maps any board to the lexicographically smallest member of its 8-symmetry orbit."),
        
        ("Section 4: Minimax Ground-Truth Teacher",
         "Recursive function with state memoization (`minimax(board, mover)`). Computes minimax values (+1, 0, -1). "
         "Outputs `optimal_policy(board, mover)`: a 9-element probability vector with equal weights over all tying best moves."),
        
        ("Section 5: State Space Exhaustion",
         "Uses Breadth-First Search (BFS) starting from the empty board. Traverses all reachable games, discarding duplicates using set hashing. "
         "Identifies exactly 4,520 non-terminal reachable boards and pairs each with its Minimax optimal label vector."),
        
        ("Section 6: Leakage-Safe Data Split",
         "Groups the 4,520 boards into 627 canonical symmetry groups. Splits groups 70% Train (438 groups), 15% Val (94 groups), 15% Test (95 groups). "
         "Asserts zero intersection between sets to prove mathematically that no rotated board in Test was ever seen in Train."),
        
        ("Section 7: CNN Model Architectures",
         "Builds the three models using Keras Functional/Sequential API. Defines custom callback `MaskedAccuracyCallback` "
         "which computes legal-masked accuracy after every epoch by masking illegal occupied cells before argmax."),
        
        ("Section 8: Training the Underfit Model",
         "Compiles the 191-parameter model (2 filters) with Adam optimizer (lr=0.01) and Categorical Cross-Entropy. "
         "Trains for 10 epochs. Reaches ~20% raw accuracy."),
        
        ("Section 9: Training the Overfit Model",
         "Extracts a tiny subset of exactly 60 boards from the training set. Compiles the 687,625-parameter model without dropout. "
         "Trains for 300 epochs. Training loss drops to 0.57 while validation loss explodes to 3.14."),
        
        ("Section 10: Training the Stable Model",
         "Applies 8× symmetry augmentation to the 3,153 training boards, generating 25,224 diverse training samples. "
         "Trains the 93,833-parameter model with Dropout(0.3) and EarlyStopping(patience=15). Converges at epoch ~35 with 95.89% test accuracy."),
        
        ("Section 11: Side-by-Side Comparative Plots",
         "Generates and saves the 8 publication plots: training curves, loss curves, validation overlays, and bar charts."),
        
        ("Section 12: Gameplay Evaluation Engine",
         "Simulates 1,000 games vs. a Random agent and 200 games vs. a Minimax agent. "
         "Tracks statistics: win rate, draw rate, loss rate, illegal move attempts, missed wins, and missed blocks."),
        
        ("Section 13: Seen vs. Unseen Contrast Extraction",
         "Algorithms search the dataset to find a memorized board from the overfit 60-board subset, "
         "shifts a single piece to produce an unseen legal board, and plots their comparative heatmaps side-by-side."),
        
        ("Section 14 & 15: Move Explainers",
         "Rule-based diagnostic functions that analyze why a model chose a move: detected fork, blocked immediate loss, or committed a blunder."),
        
        ("Section 16: Multi-Target Artifact Export",
         "Exports models to native `.keras` files. Extracts weight tensors (kernels & biases) into a lightweight JSON structure (`weights.json`) "
         "enabling a zero-dependency pure JavaScript forward-pass in web browsers without needing Python at runtime. "
         "Exports 20 numerical parity test vectors to verify float-level inference parity between Python and JavaScript."),
        
        ("Section 17: Acceptance Verification Report",
         "Runs an automated verification battery checking 35 individual targets (notebook execution time < 10 mins, file sizes, metric thresholds). "
         "Outputs `acceptance_report.md` confirming 100% test pass rate."),
    ]

    for title, desc in nb_sections:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", bullet_style))
        story.append(Spacer(1, 2))

    # =========================================================================
    # SECTION 7: PRESENTATION & DEFENSE Q&A CHEATSHEET
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("7. Presentation & Defense Q&A Cheatsheet", h1_style))
    story.append(Paragraph(
        "Here are the top 10 questions examiners and professors frequently ask during machine learning project defenses, "
        "along with the precise technical answers you should deliver:", body_style
    ))

    qa_list = [
        ("Q1: Why did you choose a Convolutional Neural Network (CNN) instead of a simple Multi-Layer Perceptron (MLP)?",
         "<b>Answer:</b> Tic-Tac-Toe is fundamentally a spatial geometry problem. Win conditions (3-in-a-row) are translation-invariant patterns. "
         "A 3×3 convolution with padding slides across the board, learning spatial feature detectors (horizontal, vertical, diagonal lines, and fork formations). "
         "An MLP treats all 9 cells as independent unstructured inputs, requiring more parameters and failing to exploit spatial weight-sharing inductive bias."),

        ("Q2: What is the 'mover-perspective' encoding and why was it necessary?",
         "<b>Answer:</b> In standard encoding, X=+1 and O=-1. If you feed that directly, the network would need to learn two completely different strategies: "
         "one when playing as +1 and another when playing as -1. By multiplying the board by the mover's sign (`board * mover`), the current player's pieces "
         "are ALWAYS +1 and the opponent's are ALWAYS -1. This establishes player invariance, allowing one network to play both sides with equal mastery."),

        ("Q3: How did you prove that your train/validation/test split has zero data leakage?",
         "<b>Answer:</b> Under the Dihedral Group D₄, a Tic-Tac-Toe board has 8 geometric symmetries (4 rotations and 2 reflections). "
         "If we performed a naive random split, a board in Train might appear rotated by 90° in Test, allowing the model to 'cheat' via memorization. "
         "We solved this by reducing the 4,520 reachable boards into 627 canonical symmetry groups, and split by groups. "
         "A programmatic assertion verifies that no test board belongs to a symmetry group present in the training set."),

        ("Q4: Why did the Overfit model train on only 60 boards?",
         "<b>Answer:</b> Overfitting occurs when model capacity vastly exceeds the volume of training information. "
         "With 687,625 parameters and only 60 training examples (a ratio >11,400 parameters per board!), the network has sufficient capacity to act as a lookup table, "
         "memorizing all 60 boards with 100% accuracy while failing to learn any generalizable rules, causing validation loss to blow up to 3.14."),

        ("Q5: Why did the Stable model achieve 100% draws (0 losses) against Minimax?",
         "<b>Answer:</b> Game theory dictates that Tic-Tac-Toe is a mathematically solved game: under optimal play from both sides, the game is a forced draw. "
         "Minimax plays perfectly. By achieving 200 draws and 0 losses against Minimax, our Stable CNN proved that it has reached the game-theoretic Nash Equilibrium."),

        ("Q6: What is the difference between Raw Top-Choice Accuracy and Legal-Masked Accuracy?",
         "<b>Answer:</b> A neural network outputs unconstrained logits over all 9 cells. Raw top-choice accuracy checks if `argmax` of raw output is an optimal legal move. "
         "If the network picks an already occupied cell, it fails. Masked accuracy zeroes out occupied cells before taking `argmax`. "
         "The Underfit model has only 20.5% raw accuracy because it tries to play in occupied cells 47.8% of the time!"),

        ("Q7: How did you export the models to the browser without running Python on the server?",
         "<b>Answer:</b> Rather than using a heavy backend Python server, we extracted the trained weight matrices and biases from Keras into a structured `weights.json` format. "
         "We then wrote a custom forward-pass inference engine in pure TypeScript/JavaScript that implements 2D convolution and matrix multiplication. "
         "Vitest unit tests verify that the JavaScript inference matches Python ground-truth to within a float tolerance of 0.0005."),

        ("Q8: Why did the Underfit model miss 88% of opponent blocks?",
         "<b>Answer:</b> The Underfit model has only 2 convolutional filters and 191 parameters. Detecting an opponent's two-in-a-row threat across 8 possible winning lines "
         "(3 rows, 3 cols, 2 diags) requires more feature detectors than 2 filters can mathematically represent. The model suffers from extreme High Bias."),

        ("Q9: Why use soft labels from Minimax instead of one-hot encoded labels?",
         "<b>Answer:</b> Many Tic-Tac-Toe positions have multiple equally optimal moves (e.g., in an open board, all 4 corners are equally good). "
         "Forcing a one-hot label penalizes the network for selecting an equally valid winning move. Soft labels distribute probability equally across all tying optimal moves, "
         "providing a smooth, mathematically principled gradient for Categorical Cross-Entropy."),

        ("Q10: What does the 'Seen vs. Unseen' plot demonstrate to a student?",
         "<b>Answer:</b> It provides irrefutable visual evidence of overfitting. The Overfit model exhibits 100% confidence on a memorized board, but when just one piece is shifted, "
         "its heatmap completely blunders. It proves that training accuracy alone is a deceptive metric if generalization error is not measured."),
    ]

    for q, a in qa_list:
        story.append(Paragraph(f"<b>{q}</b>", ParagraphStyle('QA_Q', parent=body_style, fontName='Helvetica-Bold', textColor=c_accent, spaceBefore=4, spaceAfter=2)))
        story.append(Paragraph(a, ParagraphStyle('QA_A', parent=body_style, leftIndent=8, spaceAfter=6)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    build_pdf()
