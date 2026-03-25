import { useState, useEffect } from 'react';
import styles from './QuizPlayer.module.css';
import { type Vraag } from '../../../utils/types';

interface QuizPlayerProps {
    moduleNaam: string;
    vragen: Vraag[];
    onClose: () => void;
}

const QuizPlayer = ({ moduleNaam, vragen, onClose }: QuizPlayerProps) => {
    const [huidigeIndex, setHuidigeIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResultaat, setShowResultaat] = useState(false);
    const [gehusseldeAntwoorden, setGehusseldeAntwoorden] = useState<any[]>([]);

    const [gekozenIndex, setGekozenIndex] = useState<number | null>(null);
    const [isBeantwoord, setIsBeantwoord] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const [antwoordenLog, setAntwoordenLog] = useState<{
        vraag: string,
        gekozen: string,
        correct: string,
        isGoed: boolean,
        categorie: string
    }[]>([]);

    const huidigeVraag = vragen[huidigeIndex];
    // FIX: Ondersteun zowel vraagTekst als vraag_tekst uit de DB
    const displayTekst = huidigeVraag ? ((huidigeVraag as any).vraag_tekst || huidigeVraag.vraagTekst) : "";
    const correctIdx = huidigeVraag ? ((huidigeVraag as any).correct_index ?? huidigeVraag.correctAntwoordIndex ?? 0) : 0;

    const voortgangPercentage = (huidigeIndex / vragen.length) * 100;

    useEffect(() => {
        if (huidigeVraag) {
            let ants = huidigeVraag.antwoorden;
            // Als antwoorden nog een JSON string is (gebeurt soms bij directe DB imports)
            if (typeof ants === 'string') {
                try { ants = JSON.parse(ants); } catch { ants = []; }
            }

            const alle = Array.isArray(ants) ? ants.map((t, i) => ({
                tekst: t,
                isCorrect: i === correctIdx
            })) : [];

            setGehusseldeAntwoorden([...alle].sort(() => Math.random() - 0.5));
            setGekozenIndex(null);
            setIsBeantwoord(false);
        }
    }, [huidigeIndex, huidigeVraag, correctIdx]);

    const checkAntwoord = (index: number, isCorrect: boolean) => {
        if (isBeantwoord) return;

        const logItem = {
            vraag: displayTekst,
            gekozen: gehusseldeAntwoorden[index].tekst,
            correct: huidigeVraag.antwoorden[correctIdx],
            isGoed: isCorrect,
            categorie: huidigeVraag.categorie || 'Algemeen'
        };

        setAntwoordenLog(prev => [...prev, logItem]);
        setGekozenIndex(index);
        setIsBeantwoord(true);
        if (isCorrect) setScore(prev => prev + 1);
    };

    const volgendeVraag = () => {
        if (huidigeIndex + 1 < vragen.length) {
            setHuidigeIndex(huidigeIndex + 1);
        } else {
            setShowResultaat(true);
        }
    };

    const getCategorieStats = () => {
        const stats: Record<string, { goed: number; totaal: number }> = {};
        antwoordenLog.forEach(item => {
            if (!stats[item.categorie]) stats[item.categorie] = { goed: 0, totaal: 0 };
            stats[item.categorie].totaal++;
            if (item.isGoed) stats[item.categorie].goed++;
        });
        return stats;
    };

    const getKnopStijl = (index: number, optie: any) => {
        if (!isBeantwoord) return styles.optieBtn;
        if (optie.isCorrect) return `${styles.optieBtn} ${styles.correct}`;
        if (gekozenIndex === index && !optie.isCorrect) return `${styles.optieBtn} ${styles.fout}`;
        return `${styles.optieBtn} ${styles.gedimd}`;
    };

    if (!huidigeVraag) return null;

    if (showResultaat) {
        const percentage = Math.round((score / vragen.length) * 100);
        const catStats = getCategorieStats();

        return (
            <div className={styles.overlay}>
                <div className={styles.resultCardExtended}>
                    <h2 className={styles.title}>Quiz Voltooid!</h2>
                    <p className={styles.subtitle}>{moduleNaam}</p>

                    <div className={styles.visualsGrid}>
                        <div className={styles.donutWrapper}>
                            <div
                                className={styles.donut}
                                style={{ '--percentage': `${percentage}%` } as React.CSSProperties}
                            >
                                <div className={styles.donutInner}>
                                    <span className={styles.donutNumber}>{percentage}%</span>
                                </div>
                            </div>
                            <p className={styles.statLabel}>Totale Score</p>
                        </div>

                        <div className={styles.categoryStats}>
                            <h4 className={styles.sectionTitle}>Sectie Analyse</h4>
                            {Object.entries(catStats).map(([name, data]) => {
                                const catPerc = Math.round((data.goed / data.totaal) * 100);
                                return (
                                    <div key={name} className={styles.catRow}>
                                        <div className={styles.catInfo}>
                                            <span>{name}</span>
                                            <span>{catPerc}%</span>
                                        </div>
                                        <div className={styles.catBarBase}>
                                            <div className={styles.catBarFill} style={{ width: `${catPerc}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>Goed</span>
                            <span className={styles.statValue} style={{ color: '#2ecc71' }}>{score}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>Fout</span>
                            <span className={styles.statValue} style={{ color: '#e74c3c' }}>{vragen.length - score}</span>
                        </div>
                    </div>

                    <button className={styles.secondaryBtn} onClick={() => setShowReview(!showReview)}>
                        {showReview ? '🔼 Verberg Details' : '🔽 Bekijk Antwoorden'}
                    </button>

                    {showReview && (
                        <div className={styles.reviewList}>
                            {antwoordenLog.map((item, i) => (
                                <div key={i} className={item.isGoed ? styles.reviewItemCorrect : styles.reviewItemWrong}>
                                    <p className={styles.reviewQuestion}><strong>{i + 1}.</strong> {item.vraag}</p>
                                    {!item.isGoed && (
                                        <div className={styles.reviewDetails}>
                                            <span>Jouw keuze: {item.gekozen}</span>
                                            <span className={styles.correctAnswer}>Correct: {item.correct}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.resultFooter}>
                        <button onClick={onClose} className={styles.finishBtn}>Terug naar Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.quizCard}>
                <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBarFill} style={{ width: `${voortgangPercentage}%` }}></div>
                </div>

                <div className={styles.progressHeader}>
                    <span className={styles.moduleTag}>{moduleNaam}</span>
                    <span className={styles.countText}>Vraag {huidigeIndex + 1} / {vragen.length}</span>
                </div>

                <h2 className={styles.vraagTekst}>{displayTekst}</h2>

                <div className={styles.optiesGrid}>
                    {gehusseldeAntwoorden.map((optie, i) => (
                        <button
                            key={i}
                            className={getKnopStijl(i, optie)}
                            onClick={() => checkAntwoord(i, optie.isCorrect)}
                            disabled={isBeantwoord}
                        >
                            <span>{optie.tekst}</span>
                            <span className={styles.statusIcon}>
                                {isBeantwoord && optie.isCorrect && "✓"}
                                {isBeantwoord && gekozenIndex === i && !optie.isCorrect && "✗"}
                            </span>
                        </button>
                    ))}
                </div>

                {isBeantwoord && huidigeVraag.uitleg && (
                    <div className={`${styles.uitlegBox} ${gehusseldeAntwoorden[gekozenIndex!].isCorrect ? styles.uitlegCorrect : styles.uitlegFout}`}>
                        <div className={styles.uitlegHeader}>
                            <strong>{gehusseldeAntwoorden[gekozenIndex!].isCorrect ? 'Correct!' : 'Helaas...'}</strong>
                            <span>Uitleg:</span>
                        </div>
                        <p className={styles.uitlegTekst}>{huidigeVraag.uitleg}</p>
                    </div>
                )}

                <div className={styles.footer}>
                    {isBeantwoord ? (
                        <button onClick={volgendeVraag} className={styles.nextBtn}>
                            {huidigeIndex + 1 === vragen.length ? 'Bekijk Resultaat' : 'Volgende Vraag →'}
                        </button>
                    ) : (
                        <button onClick={onClose} className={styles.exitBtn}>Quiz Afbreken</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPlayer;